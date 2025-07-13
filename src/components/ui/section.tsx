import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SectionProps {
  icon: IconDefinition;
  title: string;
  children: React.ReactNode;
}

export default function Section({
  icon,
  title,
  children,
}: SectionProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-2">
      <div className="flex items-center mb-2">
        <FontAwesomeIcon
          icon={icon}
          className="mr-2 text-gray-400 dark:text-gray-500"
        />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
} 