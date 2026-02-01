package main

import (
	"fmt"
	"time"

	"example/hello/ports"

	"github.com/google/uuid"
	"github.com/teambition/rrule-go"
)

func main() {
	fmt.Println("Hello, Calendar Service!")

	calendar, err := ports.NewCaldavCalendarAdapter()
	if err != nil {
		fmt.Printf("Error creating CaldavCalendarAdapter: %v\n", err)
		return
	}

	calendarID, err := calendar.CreateCalendar()
	if err != nil {
		fmt.Printf("Error creating calendar: %v\n", err)
		return
	}

	fmt.Printf("Created calendar with ID: %s\n", calendarID)

	events, err := calendar.GetCalendarEvents(calendarID, time.Now())
	if err != nil {
		fmt.Printf("Error getting calendar events: %v\n", err)
		return
	}

	fmt.Printf("Retrieved %d events from calendar %s\n", len(events), calendarID)

	err = calendar.AddCalendarEvent(calendarID, ports.CalendarEvent{
		StartTime: time.Now().Add(time.Hour * 24),
		EndTime:   time.Now().Add(time.Hour * 27),
		Title:     "Test Appointment",
		ID:        uuid.NewString(),
	})
	if err != nil {
		fmt.Printf("Error adding calendar event: %v\n", err)
		return
	}

	rrule, err := rrule.NewRRule(rrule.ROption{
		Freq: rrule.DAILY,
	})
	if err != nil {
		fmt.Printf("Error creating rrule: %v\n", err)
		return
	}

	err = calendar.AddRecurringCalendarEvent(calendarID, ports.CalendarEvent{
		ID:        uuid.NewString(),
		Title:     "Recurring Test Appointment",
		StartTime: time.Date(time.Now().Year(), time.Now().Month(), time.Now().Day(), 10, 0, 0, 0, time.Local),
		EndTime:   time.Date(time.Now().Year(), time.Now().Month(), time.Now().Day(), 11, 0, 0, 0, time.Local),
	}, *rrule,
	)

	if err != nil {
		fmt.Printf("Error adding calendar event: %v\n", err)
		return
	}

	fmt.Println("Added event to calendar successfully")

	events, err = calendar.GetCalendarEvents(calendarID, time.Now())
	if err != nil {
		fmt.Printf("Error getting calendar events: %v\n", err)
		return
	}

	fmt.Printf("Retrieved %d events (today) from calendar %s after adding new event\n", len(events), calendarID)

	if len(events) > 0 {
		printEvent(events[0])
	}

	events, err = calendar.GetCalendarEvents(calendarID, time.Now().Add(time.Hour*24))
	if err != nil {
		fmt.Printf("Error getting calendar events: %v\n", err)
		return
	}

	fmt.Printf("Retrieved %d events (tomorrow) from calendar %s after adding new event\n", len(events), calendarID)

	for _, event := range events {
		printEvent(event)
	}

	events, err = calendar.GetCalendarEvents(calendarID, time.Now().Add(time.Hour*48))
	if err != nil {
		fmt.Printf("Error getting calendar events: %v\n", err)
		return
	}

	fmt.Printf("Retrieved %d events (day after tomorrow) from calendar %s after adding new event\n", len(events), calendarID)

	for _, event := range events {
		printEvent(event)
	}

}

func printEvent(event ports.CalendarEvent) {
	fmt.Println("----- Event -----")
	fmt.Println("Event ID:", event.ID)
	fmt.Println("Title:", event.Title)
	fmt.Println("Start Time:", event.StartTime)
	fmt.Println("End Time:", event.EndTime)
	fmt.Println("-----------------")
}
