import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, styled, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

export interface TabBarItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabBarProps {
  items: TabBarItem[];
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  sx?: any;
}

const Container = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  position: "relative",
  backgroundColor: alpha(theme.palette.action.hover, 0.04),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  padding: theme.spacing(0.25),
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
}));

const TabItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isActive" && prop !== "isDisabled",
})<{ isActive?: boolean; isDisabled?: boolean }>(
  ({ theme, isActive, isDisabled }) => ({
    position: "relative",
    padding: theme.spacing(0.75, 2),
    borderRadius: Number(theme.shape.borderRadius) * 1.5,
    cursor: isDisabled ? "not-allowed" : "pointer",
    userSelect: "none",
    transition: "color 150ms ease",
    zIndex: isActive ? 2 : 1,
    color: isDisabled
      ? theme.palette.text.disabled
      : isActive
      ? theme.palette.primary.contrastText
      : theme.palette.text.secondary,
    fontWeight: isActive ? 600 : 500,

    "&:hover": {
      color: !isDisabled && !isActive ? theme.palette.text.primary : undefined,
    },
  }),
);

const ActivePill = styled(motion.div)(({ theme }) => ({
  position: "absolute",
  top: 6,
  left: 6,
  right: 6,
  bottom: 6,
  backgroundColor: theme.palette.primary.main,
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  boxShadow: theme.shadows[2],
  zIndex: 0,
}));

const sizeMap = {
  small: {
    fontSize: "0.8125rem",
    padding: [0.5, 1.5],
    containerPadding: 0.25,
  },
  medium: {
    fontSize: "0.875rem",
    padding: [0.75, 2],
    containerPadding: 0.25,
  },
  large: {
    fontSize: "0.9375rem",
    padding: [1, 2.5],
    containerPadding: 0.375,
  },
};

export const TabBar: React.FC<TabBarProps> = ({
  items,
  value,
  onChange,
  size = "medium",
  fullWidth = false,
  sx,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pillDimensions, setPillDimensions] = useState({ width: 0, x: 0 });
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeConfig = sizeMap[size];

  useEffect(() => {
    const currentIndex = items.findIndex((item) => item.value === value);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [value, items]);

  useEffect(() => {
    const activeRef = itemRefs.current[activeIndex];
    const container = containerRef.current;

    if (activeRef && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeRef.getBoundingClientRect();

      setPillDimensions({
        width: activeRect.width,
        x: activeRect.left - containerRect.left,
      });
    }
  }, [activeIndex, items]);

  const handleItemClick = (item: TabBarItem, index: number) => {
    if (!item.disabled && item.value !== value) {
      setActiveIndex(index);
      onChange(item.value);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    item: TabBarItem,
    index: number,
  ) => {
    let newIndex = index;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        newIndex = index > 0 ? index - 1 : items.length - 1;
        break;
      case "ArrowRight":
        event.preventDefault();
        newIndex = index < items.length - 1 ? index + 1 : 0;
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleItemClick(item, index);
        return;
      default:
        return;
    }

    // Find the next non-disabled tab
    while (items[newIndex]?.disabled && newIndex !== index) {
      if (event.key === "ArrowLeft" || event.key === "End") {
        newIndex = newIndex > 0 ? newIndex - 1 : items.length - 1;
      } else {
        newIndex = newIndex < items.length - 1 ? newIndex + 1 : 0;
      }
    }

    if (!items[newIndex]?.disabled) {
      itemRefs.current[newIndex]?.focus();
      setActiveIndex(newIndex);
      onChange(items[newIndex].value);
    }
  };

  return (
    <Container
      ref={containerRef}
      role="tablist"
      sx={{
        width: fullWidth ? "100%" : "auto",
        p: sizeConfig.containerPadding,
        ...sx,
      }}
    >
      <AnimatePresence>
        {pillDimensions.width > 0 && (
          <ActivePill
            key="active-pill"
            initial={false}
            animate={{
              x: pillDimensions.x,
              width: pillDimensions.width,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
            }}
          />
        )}
      </AnimatePresence>

      {items.map((item, index) => (
        <TabItem
          key={item.value}
          ref={(el) => {
            itemRefs.current[index] = el as HTMLDivElement | null;
          }}
          role="tab"
          tabIndex={item.value === value ? 0 : -1}
          aria-selected={item.value === value}
          aria-disabled={item.disabled}
          isActive={item.value === value}
          isDisabled={item.disabled}
          onClick={() => handleItemClick(item, index)}
          onKeyDown={(event) => handleKeyDown(event, item, index)}
          sx={{
            flex: fullWidth ? 1 : "none",
            py: sizeConfig.padding[0],
            px: sizeConfig.padding[1],
            mr: index === items.length - 1 ? "15px" : 0,
            outline: "none",
            "&:focus-visible": {
              outline: `2px solid currentColor`,
              outlineOffset: "2px",
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: sizeConfig.fontSize,
              fontWeight: "inherit",
              color: "inherit",
              marginLeft: "10px",
            }}
          >
            {item.label}
          </Typography>
        </TabItem>
      ))}
    </Container>
  );
};
