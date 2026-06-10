"use client";

import { useEffect, useState } from "react";

import { cn } from "../utils/cn";

export type DropdownFilterBarOption = {
  href: string;
  key?: string;
  label: string;
  selected?: boolean;
};

export type DropdownFilterBarItem = {
  active?: boolean;
  href: string;
  key: string;
  label: string;
  options?: DropdownFilterBarOption[];
  selectedOptionKey?: string;
  showCaret?: boolean;
};

type DropdownFilterBarProps = {
  className?: string;
  expandedKey?: string | null;
  overlayClassName?: string;
  items: DropdownFilterBarItem[];
  onItemSelect?: (key: string) => void;
  onOptionSelect?: (itemKey: string, optionKey: string) => void;
  onRequestClose?: () => void;
};

type UseDropdownFilterBarStateProps<T extends string> = {
  initialActiveKey: T;
  initialExpandedKey?: T | null;
  initialSelectedOptions: Record<string, string>;
  isDropdownKey: (key: T) => boolean;
};

export function useDropdownFilterBarState<T extends string>({
  initialActiveKey,
  initialExpandedKey = null,
  initialSelectedOptions,
  isDropdownKey
}: UseDropdownFilterBarStateProps<T>) {
  const [activeKey, setActiveKey] = useState<T>(initialActiveKey);
  const [expandedKey, setExpandedKey] = useState<T | null>(initialExpandedKey);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialSelectedOptions);

  return {
    activeKey,
    closeDropdown() {
      setExpandedKey(null);
    },
    expandedKey,
    onItemSelect(key: string) {
      const nextKey = key as T;
      setActiveKey(nextKey);
      setExpandedKey((current) => (isDropdownKey(nextKey) ? (current === nextKey ? null : nextKey) : null));
    },
    onOptionSelect(itemKey: string, optionKey: string) {
      setActiveKey(itemKey as T);
      setSelectedOptions((current) => ({ ...current, [itemKey]: optionKey }));
      setExpandedKey(null);
    },
    selectedOptions
  };
}

export function DropdownFilterBar({
  className,
  expandedKey,
  overlayClassName,
  items,
  onItemSelect,
  onOptionSelect,
  onRequestClose
}: DropdownFilterBarProps) {
  const activeItem = items.find((item) => (expandedKey === undefined ? item.active : item.key === expandedKey) && item.options?.length);

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [activeItem]);

  return (
    <div className={cn("relative z-20 bg-fill-white", className)}>
      <nav className="flex h-[46px] items-center gap-[30px] overflow-x-auto px-3 text-[15px] leading-[21px] text-text-secondary">
        {items.map((item) => {
          const displayLabel = getFilterDisplayLabel(item);
          const className = cn(
            "relative inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap border-0 bg-transparent p-0 font-normal no-underline transition-[color,transform] duration-200",
            item.active ? "font-medium text-brand-action" : "text-text-secondary"
          );
          const children = (
            <>
              <span>{displayLabel}</span>
              {item.showCaret !== false ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 size-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-fill-disabled transition-transform duration-200",
                    item.active && "-scale-y-100 border-t-brand-action"
                  )}
                />
              ) : null}
              {item.active ? (
                <span aria-hidden="true" className="absolute -bottom-2 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-brand-action" />
              ) : null}
            </>
          );

          return (
            <button
              key={item.key}
              aria-current={item.active ? "true" : undefined}
              aria-expanded={item.options?.length ? activeItem?.key === item.key : undefined}
              className={className}
              type="button"
              onClick={() => onItemSelect?.(item.key)}
            >
              {children}
            </button>
          );
        })}
      </nav>
      {activeItem?.options?.length ? (
        <>
          <button
            aria-label="收起筛选条件"
            className={cn(
              "fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] touch-none overscroll-contain border-0 bg-black/55 p-0",
              overlayClassName
            )}
            style={{ top: "var(--dropdown-overlay-top, 145px)" }}
            type="button"
            onTouchMove={(event) => event.preventDefault()}
            onClick={onRequestClose}
          />
          <div className="absolute left-0 top-[46px] z-30 w-full overflow-hidden rounded-b-[8px] bg-fill-white">
            {activeItem.options.map((option, index) => (
              <button
                key={option.key ?? option.label}
                className={cn(
                  "flex min-h-10 w-full items-center border-0 bg-fill-white px-3.5 text-left text-[14px] leading-5 transition-colors duration-200",
                  option.selected ? "font-medium text-brand-action" : "font-normal text-text-secondary"
                )}
                style={{ transitionDelay: `${index * 28}ms` }}
                type="button"
                onClick={() => {
                  onOptionSelect?.(activeItem.key, option.key ?? option.label);
                  onRequestClose?.();
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function getFilterDisplayLabel(item: DropdownFilterBarItem) {
  if (!item.active || !item.options?.length) {
    return item.label;
  }

  const selectedOption = item.options.find((option) => {
    const optionKey = option.key ?? option.label;
    return item.selectedOptionKey ? optionKey === item.selectedOptionKey : option.selected;
  });

  return selectedOption?.label ?? item.label;
}
