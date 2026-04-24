export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  joiningDate: string;
}

export const mockUsers: UserData[] = [
  { id: 1, name: "Marcus Thorne", email: "m.thorne@velodrive.com", phone: "+1 (555) 102-4432", status: "Active", joiningDate: "2023-01-15" },
  { id: 2, name: "Elena Rodriguez", email: "e.rodriguez@velodrive.com", phone: "+34 612 345 678", status: "Active", joiningDate: "2023-02-20" },
  { id: 3, name: "Kenji Sato", email: "k.sato@velodrive.com", phone: "+81 90-1234-5678", status: "Inactive", joiningDate: "2023-03-10" },
  { id: 4, name: "Sarah Al-Farsi", email: "s.alfarsi@velodrive.com", phone: "+971 50 123 4567", status: "Active", joiningDate: "2023-04-05" },
  { id: 5, name: "Julian Vance", email: "j.vance@velodrive.com", phone: "+1 (555) 567-8901", status: "Active", joiningDate: "2023-05-12" },
  { id: 6, name: "Amara Okoro", email: "a.okoro@velodrive.com", phone: "+234 803 123 4567", status: "Inactive", joiningDate: "2023-06-18" },
  { id: 7, name: "George Lindberg", email: "g.lindberg@velodrive.com", phone: "+46 70 123 45 67", status: "Active", joiningDate: "2023-07-22" },
  { id: 8, name: "Maya Chen", email: "m.chen@velodrive.com", phone: "+86 138 1234 5678", status: "Active", joiningDate: "2023-08-30" },
  { id: 9, name: "Lukas Weber", email: "l.weber@velodrive.com", phone: "+49 151 123 45678", status: "Active", joiningDate: "2023-09-14" },
  { id: 10, name: "Isabella Rossi", email: "i.rossi@velodrive.com", phone: "+39 312 345 6789", status: "Inactive", joiningDate: "2023-10-05" },
  { id: 11, name: "David Kim", email: "d.kim@velodrive.com", phone: "+82 10-1234-5678", status: "Active", joiningDate: "2023-11-11" },
  { id: 12, name: "Claire Dupont", email: "c.dupont@velodrive.com", phone: "+33 6 12 34 56 78", status: "Active", joiningDate: "2023-12-01" },
  { id: 13, name: "Omar Hassan", email: "o.hassan@velodrive.com", phone: "+20 100 123 4567", status: "Active", joiningDate: "2024-01-10" },
  { id: 14, name: "Sonia Gupta", email: "s.gupta@velodrive.com", phone: "+91 98765 43210", status: "Inactive", joiningDate: "2024-02-14" },
  { id: 15, name: "Thomas Wright", email: "t.wright@velodrive.com", phone: "+44 7700 900123", status: "Active", joiningDate: "2024-03-20" },
  { id: 16, name: "Sofia Silva", email: "s.silva@velodrive.com", phone: "+351 912 345 678", status: "Active", joiningDate: "2024-04-12" },
  { id: 17, name: "Nitin Kumar", email: "n.kumar@velodrive.com", phone: "+91 99887 76655", status: "Active", joiningDate: "2024-05-05" },
  { id: 18, name: "Rina Patel", email: "r.patel@velodrive.com", phone: "+44 7890 123456", status: "Inactive", joiningDate: "2024-06-18" },
  { id: 19, name: "Victor Volkov", email: "v.volkov@velodrive.com", phone: "+7 900 123-45-67", status: "Active", joiningDate: "2024-07-04" },
  { id: 20, name: "Emma Wilson", email: "e.wilson@velodrive.com", phone: "+61 412 345 678", status: "Active", joiningDate: "2024-08-15" },
];
