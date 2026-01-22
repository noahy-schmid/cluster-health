import { create } from "zustand";
import { StaffMemberBasic, StaffMemberDetailed } from "../types/staff";

interface StaffStore {
  // Basic staff list for homepage
  staffMembers: StaffMemberBasic[];
  setStaffMembers: (members: StaffMemberBasic[]) => void;

  // Detailed staff information cache
  detailedStaff: Record<string, StaffMemberDetailed>;
  setDetailedStaff: (id: string, staff: StaffMemberDetailed) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Get a specific staff member from cache
  getStaffById: (id: string) => StaffMemberDetailed | null;
}

export const useStaffStore = create<StaffStore>((set, get) => ({
  staffMembers: [],
  setStaffMembers: (members) => set({ staffMembers: members }),

  detailedStaff: {},
  setDetailedStaff: (id, staff) =>
    set((state) => ({
      detailedStaff: {
        ...state.detailedStaff,
        [id]: staff,
      },
    })),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  getStaffById: (id) => {
    const state = get();
    return state.detailedStaff[id] || null;
  },
}));
