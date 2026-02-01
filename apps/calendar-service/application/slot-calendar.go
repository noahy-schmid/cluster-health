package application

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/emersion/go-ical"
	"github.com/yinjun1991/caldav-client-go/caldav"
	
)

// SlotCalendar represents the calendar for managing slots.
type SlotCalendar struct {
	id                string
	calendarAccountId string
	client            *caldav.Client
	calendarPath      string
}

func NewSlotCalendar(ctx context.Context, id string, calendarAccountId string) (*SlotCalendar, error) {
	client, calendarPath, err := createCalendar(ctx, id)
	if err != nil {
		return nil, err
	}

	return &SlotCalendar{
		id:                id,
		calendarAccountId: calendarAccountId,
		client:            client,
		calendarPath:      calendarPath,
	}, nil
}

func createCalendar(ctx context.Context, id string) (*caldav.Client, string, error) {
	username := os.Getenv("RADICALE_USERNAME")
	password := os.Getenv("RADICALE_PASSWORD")
	radicaleURL := os.Getenv("RADICALE_URL")

	if username == "" || password == "" || radicaleURL == "" {
		return nil, "", fmt.Errorf("RADICALE_USERNAME, RADICALE_PASSWORD, and RADICALE_URL environment variables must be set")
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	httpClient := &http.Client{
		Transport: &basicAuthTransport{
			Username: username,
			Password: password,
		},
	}

	client, err := caldav.NewClient(httpClient, radicaleURL)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create caldav client: %w", err)
	}

	principal, err := client.FindCurrentUserPrincipal(ctx)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find user principal: %w", err)
	}

	calendarHome, err := client.FindCalendarHomeSet(ctx, principal)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find calendar home: %w", err)
	}

	newCalendarPath := calendarHome + id + "/"

	// Create calendar using raw MKCALENDAR request
	req, err := http.NewRequestWithContext(ctx, "MKCALENDAR", radicaleURL+newCalendarPath, nil)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create MKCALENDAR request: %w", err)
	}

	req.Header.Set("Content-Type", "application/xml; charset=utf-8")
	req.SetBasicAuth(username, password)

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, "", fmt.Errorf("failed to execute MKCALENDAR: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("failed to create calendar: %s", resp.Status)
	}

	return client, newCalendarPath, nil
}

// basicAuthTransport adds basic authentication to requests
type basicAuthTransport struct {
	Username string
	Password string
}

func (t *basicAuthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.SetBasicAuth(t.Username, t.Password)
	return http.DefaultTransport.RoundTrip(req)
}

// SlotType represents the type of appointment slot
type SlotType string

const (
	SlotTypeAppointment SlotType = "APPOINTMENT"
	SlotTypeBreak       SlotType = "BREAK"
	SlotTypeBlocked     SlotType = "BLOCKED"
)

// RepetitionPattern defines how slots should be repeated
type RepetitionPattern struct {
	Frequency string    // DAILY, WEEKLY, MONTHLY
	Count     int       // Number of repetitions (0 means no limit)
	Until     time.Time // End date for repetition (zero value means no end)
	Interval  int       // Interval between repetitions (e.g., every 2 weeks)
	ByWeekDay []string  // Days of the week (MO, TU, WE, TH, FR, SA, SU)
}

// CreateSlots creates one or more slots at the given date with specified parameters
func (sc *SlotCalendar) CreateSlots(
	ctx context.Context,
	startDate time.Time,
	slotType SlotType,
	duration time.Duration,
	repetition *RepetitionPattern,
) error {
	// Create the event
	event := ical.NewEvent()
	event.Props.SetText(ical.PropUID, fmt.Sprintf("%s-%d", sc.id, startDate.Unix()))
	event.Props.SetDateTime(ical.PropDateTimeStamp, time.Now())
	event.Props.SetDateTime(ical.PropDateTimeStart, startDate)
	event.Props.SetDateTime(ical.PropDateTimeEnd, startDate.Add(duration))
	event.Props.SetText(ical.PropSummary, string(slotType))
	event.Props.SetText(ical.PropDescription, fmt.Sprintf("Slot type: %s", slotType))
	event.Props.SetText(ical.PropStatus, "CONFIRMED")

	// Add repetition rule if specified
	if repetition != nil && repetition.Frequency != "" {
		fmt.Println("Adding repetition")
		rrule := fmt.Sprintf("FREQ=%s", repetition.Frequency)

		if repetition.Interval > 1 {
			rrule += fmt.Sprintf(";INTERVAL=%d", repetition.Interval)
		}

		if repetition.Count > 0 {
			rrule += fmt.Sprintf(";COUNT=%d", repetition.Count)
		} else if !repetition.Until.IsZero() {
			rrule += fmt.Sprintf(";UNTIL=%s", repetition.Until.Format("20060102T150405Z"))
		}

		if len(repetition.ByWeekDay) > 0 {
			rrule += ";BYDAY="
			for i, day := range repetition.ByWeekDay {
				if i > 0 {
					rrule += ","
				}
				rrule += day
			}
		}

		event.Props.Set(&ical.Prop{
			Name:  "RRULE",
			Value: rrule,
		})
	}

	// Create calendar object
	calendar := ical.NewCalendar()
	calendar.Props.SetText(ical.PropVersion, "2.0")
	calendar.Props.SetText(ical.PropProductID, "-//My Calendar Service//EN")
	calendar.Children = append(calendar.Children, event.Component)

	// Encode calendar to bytes
	var buf bytes.Buffer
	encoder := ical.NewEncoder(&buf)
	if err := encoder.Encode(calendar); err != nil {
		return fmt.Errorf("failed to encode calendar: %w", err)
	}

	// Put the calendar object
	radicaleURL := os.Getenv("RADICALE_URL")
	username := os.Getenv("RADICALE_USERNAME")
	password := os.Getenv("RADICALE_PASSWORD")

	httpClient := &http.Client{
		Transport: &basicAuthTransport{
			Username: username,
			Password: password,
		},
	}

	// Create the request with the encoded calendar data
	calendarPath := sc.calendarPath + fmt.Sprintf("%s-%d.ics", sc.id, startDate.Unix())
	calendarData := buf.Bytes()

	// Debug: print the calendar data
	fmt.Printf("Calendar data:\n%s\n", string(calendarData))
	fmt.Printf("Calendar path: %s\n", calendarPath)
	fmt.Printf("Full URL: %s\n", radicaleURL+calendarPath)

	req, err := http.NewRequestWithContext(ctx, "PUT", radicaleURL+calendarPath, bytes.NewReader(calendarData))
	if err != nil {
		return fmt.Errorf("failed to create PUT request: %w", err)
	}

	req.Header.Set("Content-Type", "text/calendar; charset=utf-8")
	req.SetBasicAuth(username, password)

	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute PUT request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to create calendar object: %s", resp.Status)
	}

	return nil
}
