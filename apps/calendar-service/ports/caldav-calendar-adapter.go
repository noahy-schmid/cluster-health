package ports

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/emersion/go-ical"
	"github.com/google/uuid"
	"github.com/teambition/rrule-go"
	"github.com/yinjun1991/caldav-client-go/caldav"
)

type CaldavCalendarAdapter struct {
	CaldavEndpoint string
	Username       string
	Password       string
	client         *caldav.Client
	httpClient     *http.Client
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

func NewCaldavCalendarAdapter() (*CaldavCalendarAdapter, error) {
	username := os.Getenv("RADICALE_USERNAME")
	password := os.Getenv("RADICALE_PASSWORD")
	radicaleURL := os.Getenv("RADICALE_URL")

	if username == "" || password == "" || radicaleURL == "" {
		return nil, fmt.Errorf("RADICALE_USERNAME, RADICALE_PASSWORD, and RADICALE_URL environment variables must be set")
	}

	httpClient := &http.Client{
		Transport: &basicAuthTransport{
			Username: username,
			Password: password,
		},
	}

	client, err := caldav.NewClient(httpClient, radicaleURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create caldav client: %w", err)
	}

	return &CaldavCalendarAdapter{
		CaldavEndpoint: radicaleURL,
		Username:       username,
		Password:       password,
		client:         client,
		httpClient:     httpClient,
	}, nil
}

func (a *CaldavCalendarAdapter) CreateCalendar() (string, error) {
	ctx := context.Background()

	principal, err := a.client.FindCurrentUserPrincipal(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to find user principal: %w", err)
	}

	calendarHome, err := a.client.FindCalendarHomeSet(ctx, principal)
	if err != nil {
		return "", fmt.Errorf("failed to find calendar home: %w", err)
	}

	calendarID := uuid.New().String()
	newCalendarPath := calendarHome + calendarID + "/"

	// Create calendar using raw MKCALENDAR request
	req, err := http.NewRequestWithContext(ctx, "MKCALENDAR", a.CaldavEndpoint+newCalendarPath, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create MKCALENDAR request: %w", err)
	}

	req.Header.Set("Content-Type", "application/xml; charset=utf-8")
	req.SetBasicAuth(a.Username, a.Password)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to execute MKCALENDAR: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to create calendar: %s", resp.Status)
	}

	return calendarID, nil
}

func (a *CaldavCalendarAdapter) AddCalendarEvent(calendarID string, event CalendarEvent) error {
	ctx := context.Background()

	principal, err := a.client.FindCurrentUserPrincipal(ctx)
	if err != nil {
		return fmt.Errorf("failed to find user principal: %w", err)
	}

	calendarHome, err := a.client.FindCalendarHomeSet(ctx, principal)
	if err != nil {
		return fmt.Errorf("failed to find calendar home: %w", err)
	}

	calendarPath := calendarHome + calendarID + "/"

	// Create the iCal event
	icalEvent := ical.NewEvent()
	icalEvent.Props.SetText(ical.PropUID, event.ID)
	icalEvent.Props.SetDateTime(ical.PropDateTimeStamp, time.Now())
	icalEvent.Props.SetDateTime(ical.PropDateTimeStart, event.StartTime)
	icalEvent.Props.SetDateTime(ical.PropDateTimeEnd, event.EndTime)
	icalEvent.Props.SetText(ical.PropSummary, event.Title)
	icalEvent.Props.SetText(ical.PropStatus, "CONFIRMED")

	// Create calendar object
	calendar := ical.NewCalendar()
	calendar.Props.SetText(ical.PropVersion, "2.0")
	calendar.Props.SetText(ical.PropProductID, "-//My Calendar Service//EN")
	calendar.Children = append(calendar.Children, icalEvent.Component)

	// Encode calendar to bytes
	var buf bytes.Buffer
	encoder := ical.NewEncoder(&buf)
	if err := encoder.Encode(calendar); err != nil {
		return fmt.Errorf("failed to encode calendar: %w", err)
	}

	// Put the calendar object
	eventPath := calendarPath + event.ID + ".ics"
	calendarData := buf.Bytes()

	req, err := http.NewRequestWithContext(ctx, "PUT", a.CaldavEndpoint+eventPath, bytes.NewReader(calendarData))
	if err != nil {
		return fmt.Errorf("failed to create PUT request: %w", err)
	}

	req.Header.Set("Content-Type", "text/calendar; charset=utf-8")
	req.SetBasicAuth(a.Username, a.Password)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute PUT request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to create calendar event: %s", resp.Status)
	}

	return nil
}

func (a *CaldavCalendarAdapter) AddRecurringCalendarEvent(calendarID string, event CalendarEvent, repetition rrule.RRule) error {
	ctx := context.Background()

	principal, err := a.client.FindCurrentUserPrincipal(ctx)
	if err != nil {
		return fmt.Errorf("failed to find user principal: %w", err)
	}

	calendarHome, err := a.client.FindCalendarHomeSet(ctx, principal)
	if err != nil {
		return fmt.Errorf("failed to find calendar home: %w", err)
	}

	calendarPath := calendarHome + calendarID + "/"

	// Create the iCal event with recurrence rule
	icalEvent := ical.NewEvent()
	icalEvent.Props.SetText(ical.PropUID, event.ID)
	icalEvent.Props.SetDateTime(ical.PropDateTimeStamp, time.Now())
	icalEvent.Props.SetDateTime(ical.PropDateTimeStart, event.StartTime)
	icalEvent.Props.SetDateTime(ical.PropDateTimeEnd, event.EndTime)
	icalEvent.Props.SetText(ical.PropSummary, event.Title)
	icalEvent.Props.SetText(ical.PropStatus, "CONFIRMED")

	// Add recurrence rule using the RRule's String() method to get the RFC format
	icalEvent.Props.SetText("RRULE", repetition.String())

	// Create calendar object
	calendar := ical.NewCalendar()
	calendar.Props.SetText(ical.PropVersion, "2.0")
	calendar.Props.SetText(ical.PropProductID, "-//My Calendar Service//EN")
	calendar.Children = append(calendar.Children, icalEvent.Component)

	// Encode calendar to bytes
	var buf bytes.Buffer
	encoder := ical.NewEncoder(&buf)
	if err := encoder.Encode(calendar); err != nil {
		return fmt.Errorf("failed to encode calendar: %w", err)
	}

	// Put the calendar object
	eventPath := calendarPath + event.ID + ".ics"
	calendarData := buf.Bytes()

	req, err := http.NewRequestWithContext(ctx, "PUT", a.CaldavEndpoint+eventPath, bytes.NewReader(calendarData))
	if err != nil {
		return fmt.Errorf("failed to create PUT request: %w", err)
	}

	req.Header.Set("Content-Type", "text/calendar; charset=utf-8")
	req.SetBasicAuth(a.Username, a.Password)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute PUT request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to create recurring calendar event: %s", resp.Status)
	}

	return nil
}

func (a *CaldavCalendarAdapter) GetCalendarEvents(calendarID string, day time.Time) ([]CalendarEvent, error) {
	ctx := context.Background()

	principal, err := a.client.FindCurrentUserPrincipal(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to find user principal: %w", err)
	}

	calendarHome, err := a.client.FindCalendarHomeSet(ctx, principal)
	if err != nil {
		return nil, fmt.Errorf("failed to find calendar home: %w", err)
	}

	calendarPath := calendarHome + calendarID + "/"

	// Normalize the day to start and end
	startOfDay := time.Date(day.Year(), day.Month(), day.Day(), 0, 0, 0, 0, day.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	// Create a CalDAV REPORT request to query events
	reportBody := fmt.Sprintf(`<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="%s" end="%s"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`, startOfDay.Format("20060102T150405Z"), endOfDay.Format("20060102T150405Z"))

	req, err := http.NewRequestWithContext(ctx, "REPORT", a.CaldavEndpoint+calendarPath, bytes.NewReader([]byte(reportBody)))
	if err != nil {
		return nil, fmt.Errorf("failed to create REPORT request: %w", err)
	}

	req.Header.Set("Content-Type", "application/xml; charset=utf-8")
	req.Header.Set("Depth", "1")
	req.SetBasicAuth(a.Username, a.Password)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute REPORT request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusMultiStatus {
		return nil, fmt.Errorf("failed to query calendar events: %s", resp.Status)
	}

	// Read and parse the response
	respBody := new(bytes.Buffer)
	_, err = respBody.ReadFrom(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Parse iCal data from response - simplified parsing
	// In a production system, you'd want to properly parse the XML multipart response
	var events []CalendarEvent

	// Extract calendar data from XML response
	responseStr := respBody.String()

	// Find all calendar-data sections in the XML
	searchPos := 0
	for {
		// Look for calendar-data tags
		startTag := "<C:calendar-data>"
		endTag := "</C:calendar-data>"

		startIdx := bytes.Index([]byte(responseStr[searchPos:]), []byte(startTag))
		if startIdx == -1 {
			// Try alternate tag format
			startTag = "<calendar-data>"
			endTag = "</calendar-data>"
			startIdx = bytes.Index([]byte(responseStr[searchPos:]), []byte(startTag))
			if startIdx == -1 {
				break
			}
		}
		startIdx += searchPos + len(startTag)

		endIdx := bytes.Index([]byte(responseStr[startIdx:]), []byte(endTag))
		if endIdx == -1 {
			break
		}
		endIdx += startIdx

		// Extract the iCal data
		icalData := responseStr[startIdx:endIdx]

		decoder := ical.NewDecoder(bytes.NewReader([]byte(icalData)))
		cal, err := decoder.Decode()
		if err == nil {
			for _, component := range cal.Children {
				if component.Name != ical.CompEvent {
					continue
				}

				// Extract UID
				var eventID string
				if uid := component.Props.Get(ical.PropUID); uid != nil {
					eventID = uid.Value
				}

				// Extract Summary (Title)
				var title string
				if summary := component.Props.Get(ical.PropSummary); summary != nil {
					title = summary.Value
				}

				// Check if this is a specific occurrence of a recurring event
				var recurrenceID time.Time
				if recID := component.Props.Get("RECURRENCE-ID"); recID != nil {
					recurrenceID, _ = recID.DateTime(time.Local)
				}

				// Extract Start Time - preserve original timezone
				var originalStart time.Time
				if dtStart := component.Props.Get(ical.PropDateTimeStart); dtStart != nil {
					startTime, err := dtStart.DateTime(time.Local)
					if err == nil {
						originalStart = startTime
					}
				}

				// Extract End Time - preserve original timezone
				var originalEnd time.Time
				if dtEnd := component.Props.Get(ical.PropDateTimeEnd); dtEnd != nil {
					endTime, err := dtEnd.DateTime(time.Local)
					if err == nil {
						originalEnd = endTime
					}
				}

				// Check if there's an RRULE
				rruleProp := component.Props.Get("RRULE")
				if rruleProp != nil && recurrenceID.IsZero() {
					// This is a recurring event - expand occurrences for the requested day
					rruleStr := rruleProp.Value

					// Parse the RRULE with DTSTART set to the original start time
					rule, err := rrule.StrToRRuleSet(fmt.Sprintf("DTSTART:%s\nRRULE:%s",
						originalStart.Format("20060102T150405"), rruleStr))
					if err == nil {
						// Get occurrences within the day range
						occurrences := rule.Between(startOfDay, endOfDay, true)
						duration := originalEnd.Sub(originalStart)

						// Get the timezone from the original event
						loc := originalStart.Location()

						for _, occurrence := range occurrences {
							// Convert occurrence to the same timezone as original event
							occurrenceInTz := occurrence.In(loc)
							events = append(events, CalendarEvent{
								ID:        eventID,
								Title:     title,
								StartTime: occurrenceInTz,
								EndTime:   occurrenceInTz.Add(duration),
							})
						}
					}
				} else {
					// Non-recurring event or specific occurrence
					event := CalendarEvent{
						ID:        eventID,
						Title:     title,
						StartTime: originalStart,
						EndTime:   originalEnd,
					}

					// If there's a RECURRENCE-ID, adjust the times to match the occurrence
					if !recurrenceID.IsZero() && !originalStart.IsZero() {
						duration := originalEnd.Sub(originalStart)
						event.StartTime = recurrenceID
						event.EndTime = recurrenceID.Add(duration)
					}

					if !event.StartTime.IsZero() && !event.EndTime.IsZero() {
						events = append(events, event)
					}
				}
			}
		}

		searchPos = endIdx + len(endTag)
	}

	return events, nil
}

func (a *CaldavCalendarAdapter) CalendarExists(calendarID string) bool {
	ctx := context.Background()

	principal, err := a.client.FindCurrentUserPrincipal(ctx)
	if err != nil {
		return false
	}

	calendarHome, err := a.client.FindCalendarHomeSet(ctx, principal)
	if err != nil {
		return false
	}

	// Try to query the calendar path
	calendarPath := calendarHome + calendarID + "/"
	req, err := http.NewRequestWithContext(ctx, "PROPFIND", a.CaldavEndpoint+calendarPath, nil)
	if err != nil {
		return false
	}

	req.Header.Set("Depth", "0")
	req.SetBasicAuth(a.Username, a.Password)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusMultiStatus
}
