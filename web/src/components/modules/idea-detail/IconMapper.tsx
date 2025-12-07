import {
  Users,
  UserCheck,
  BarChart,
  School,
  User,
  Briefcase,
  Target,
  TrendingUp,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import React from "react";

// Tipe untuk nama ikon yang valid
export type IconName =
  | "users"
  | "student"
  | "administrator"
  | "school"
  | "user"
  | "briefcase"
  | "user-check"
  | "bar-chart"
  | "target"
  | "trending-up"
  | "check-circle"
  | "help-circle";

interface IconMapperProps {
  iconName: string;
  className?: string;
}

// Map nama ikon ke komponen ikon yang sebenarnya
const iconMap: Record<IconName, React.ElementType> = {
  users: Users,
  student: User,
  administrator: Briefcase,
  school: School,
  user: User,
  "user-check": UserCheck,
  "bar-chart": BarChart,
  target: Target,
  "trending-up": TrendingUp,
  "check-circle": CheckCircle,
  "help-circle": HelpCircle,
  briefcase: Briefcase,
};

/**
 * Komponen ini berfungsi untuk me-render ikon Lucide secara dinamis
 * berdasarkan string nama ikon yang diterima dari API.
 */
export const IconMapper: React.FC<IconMapperProps> = ({
  iconName,
  className,
}) => {
  // Ambil komponen ikon dari map, atau gunakan ikon default jika tidak ditemukan
  const IconComponent = iconMap[iconName as IconName] || HelpCircle;

  return <IconComponent className={className} />;
};
