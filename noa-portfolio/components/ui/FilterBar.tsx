"use client";

interface FilterBarProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
}

export default function FilterBar({
  categories,
  activeFilter,
  onFilterChange,
}: FilterBarProps) {
  const allCategories = ["All", ...categories];

  return (
    <div className="flex flex-wrap gap-2.5 mb-10">
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onFilterChange(cat)}
          className={`px-6 py-2.5 rounded-full border text-sm font-medium font-body transition-all duration-300 ${
            activeFilter === cat
              ? "bg-[var(--text-dark)] text-white border-[var(--text-dark)]"
              : "bg-transparent text-[var(--text-dark)] border-gray-300 hover:border-[var(--text-dark)]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
