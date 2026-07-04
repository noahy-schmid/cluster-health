use chrono::NaiveDate;

use super::errors::AvailabilityError;

/// A discrete availability window within a single day. Times are in minutes-since-midnight (UTC).
#[derive(Debug, Clone, PartialEq)]
pub struct TimeSlot {
    /// Start of window in minutes since midnight (0–1439).
    pub start_minutes: u16,
    /// End of window in minutes since midnight (1–1440).
    pub end_minutes: u16,
}

impl TimeSlot {
    /// Create a new slot from HH:MM components. Returns an error when the
    /// values are out of range or the start is not before the end.
    pub fn from_hhmm(
        start_hour: u8,
        start_minute: u8,
        end_hour: u8,
        end_minute: u8,
    ) -> Result<Self, AvailabilityError> {
        if start_hour > 23 || start_minute > 59 || end_hour > 23 || end_minute > 59 {
            return Err(AvailabilityError::InvalidSlot {
                message: format!(
                    "Time values out of range: {:02}:{:02}–{:02}:{:02}",
                    start_hour, start_minute, end_hour, end_minute
                ),
            });
        }

        let start = start_hour as u16 * 60 + start_minute as u16;
        let end = end_hour as u16 * 60 + end_minute as u16;

        if start >= end {
            return Err(AvailabilityError::InvalidSlot {
                message: format!(
                    "Start {:02}:{:02} must be before end {:02}:{:02}",
                    start_hour, start_minute, end_hour, end_minute
                ),
            });
        }

        Ok(Self {
            start_minutes: start,
            end_minutes: end,
        })
    }

    pub fn start_hour(&self) -> u8 {
        (self.start_minutes / 60) as u8
    }

    pub fn start_minute(&self) -> u8 {
        (self.start_minutes % 60) as u8
    }

    pub fn end_hour(&self) -> u8 {
        (self.end_minutes / 60) as u8
    }

    pub fn end_minute(&self) -> u8 {
        (self.end_minutes % 60) as u8
    }

    fn overlaps(&self, other: &TimeSlot) -> bool {
        self.start_minutes < other.end_minutes && self.end_minutes > other.start_minutes
    }
}

/// The StylistAvailability aggregate root.
///
/// Represents all declared availability slots for a single stylist on a single
/// calendar date. Business rules (no overlapping slots, valid time ranges) are
/// enforced here. Persistence is the responsibility of an adapter.
#[derive(Debug, Clone)]
pub struct StylistAvailability {
    pub salon_id: String,
    pub stylist_id: String,
    pub date: NaiveDate,
    slots: Vec<TimeSlot>,
}

impl StylistAvailability {
    pub fn new(salon_id: String, stylist_id: String, date: NaiveDate) -> Self {
        Self {
            salon_id,
            stylist_id,
            date,
            slots: Vec::new(),
        }
    }

    /// Add an availability slot, rejecting overlaps with existing slots.
    pub fn add_slot(&mut self, slot: TimeSlot) -> Result<(), AvailabilityError> {
        if let Some(existing) = self.slots.iter().find(|s| s.overlaps(&slot)) {
            return Err(AvailabilityError::OverlappingSlot {
                message: format!(
                    "New slot {:02}:{:02}–{:02}:{:02} overlaps with existing {:02}:{:02}–{:02}:{:02}",
                    slot.start_hour(),
                    slot.start_minute(),
                    slot.end_hour(),
                    slot.end_minute(),
                    existing.start_hour(),
                    existing.start_minute(),
                    existing.end_hour(),
                    existing.end_minute(),
                ),
            });
        }

        self.slots.push(slot);
        Ok(())
    }

    /// Replace all slots with a new set (bulk update).
    pub fn replace_slots(&mut self, slots: Vec<TimeSlot>) -> Result<(), AvailabilityError> {
        // Validate the incoming set for internal overlaps before committing.
        for (i, a) in slots.iter().enumerate() {
            for b in slots.iter().skip(i + 1) {
                if a.overlaps(b) {
                    return Err(AvailabilityError::OverlappingSlot {
                        message: format!(
                            "Provided slots contain overlap: {:02}:{:02}–{:02}:{:02} vs {:02}:{:02}–{:02}:{:02}",
                            a.start_hour(), a.start_minute(), a.end_hour(), a.end_minute(),
                            b.start_hour(), b.start_minute(), b.end_hour(), b.end_minute(),
                        ),
                    });
                }
            }
        }

        self.slots = slots;
        Ok(())
    }

    pub fn slots(&self) -> &[TimeSlot] {
        &self.slots
    }

    /// Returns true if the stylist is available at the given minute-of-day.
    pub fn is_available_at(&self, hour: u8, minute: u8) -> bool {
        let m = hour as u16 * 60 + minute as u16;
        self.slots
            .iter()
            .any(|s| m >= s.start_minutes && m < s.end_minutes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_non_overlapping_slots_succeeds() {
        let mut avail = StylistAvailability::new(
            "salon-1".into(),
            "stylist-1".into(),
            NaiveDate::from_ymd_opt(2026, 1, 15).unwrap(),
        );
        let morning = TimeSlot::from_hhmm(9, 0, 12, 0).unwrap();
        let afternoon = TimeSlot::from_hhmm(13, 0, 17, 0).unwrap();

        assert!(avail.add_slot(morning).is_ok());
        assert!(avail.add_slot(afternoon).is_ok());
        assert_eq!(avail.slots().len(), 2);
    }

    #[test]
    fn add_overlapping_slot_fails() {
        let mut avail = StylistAvailability::new(
            "salon-1".into(),
            "stylist-1".into(),
            NaiveDate::from_ymd_opt(2026, 1, 15).unwrap(),
        );
        avail.add_slot(TimeSlot::from_hhmm(9, 0, 12, 0).unwrap()).unwrap();
        let result = avail.add_slot(TimeSlot::from_hhmm(11, 0, 13, 0).unwrap());
        assert!(matches!(result, Err(AvailabilityError::OverlappingSlot { .. })));
    }

    #[test]
    fn is_available_at_returns_correctly() {
        let mut avail = StylistAvailability::new(
            "salon-1".into(),
            "stylist-1".into(),
            NaiveDate::from_ymd_opt(2026, 1, 15).unwrap(),
        );
        avail.add_slot(TimeSlot::from_hhmm(9, 0, 12, 0).unwrap()).unwrap();

        assert!(avail.is_available_at(10, 30));
        assert!(!avail.is_available_at(12, 0)); // end is exclusive
        assert!(!avail.is_available_at(8, 59));
    }
}
