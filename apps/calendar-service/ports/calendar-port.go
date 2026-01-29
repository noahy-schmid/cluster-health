package ports

import (
	"time"

	"github.com/teambition/rrule-go"
)

type CalendarEvent struct {
	ID        string
	StartTime time.Time
	EndTime   time.Time
	Title     string
}

type CalendarRepository interface {
	// Creates a new calendar and returns its ID
	CreateCalendar() (string, error)
	AddCalendarEvent(calendarID string, event CalendarEvent) error
	AddReccuringCalendarEvent(calendarID string, event CalendarEvent, repetition rrule.RRule) error
	GetCalendarEvents(calendarID string, day time.Time) ([]CalendarEvent, error)
	CalendarExists(calendarID string) bool
}
