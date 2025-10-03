import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, styled, useTheme } from "@mui/material";
import { motion } from "motion/react";
import { BackgroundEffect } from "./BackgroundEffect";

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
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(15, 24, 37, 0.85)"
      : "rgba(53, 61, 65, 0.85)",
  borderRadius: "27px",
  padding: "0 30px",
  height: "54px",
  border:
    theme.palette.mode === "dark"
      ? "1.7px solid #1E2A3E"
      : "1.7px solid #020D10",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
  zIndex: 2,
}));

const TabItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isActive" && prop !== "isDisabled",
})<{ isActive?: boolean; isDisabled?: boolean }>(
  ({ isActive, isDisabled }) => ({
    position: "relative",
    padding: "0 24px",
    minWidth: "110px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "24px",
    cursor: isDisabled ? "not-allowed" : "pointer",
    userSelect: "none",
    transition: "opacity 150ms ease",
    zIndex: isActive ? 2 : 1,
    color: isDisabled ? "#666666" : isActive ? "#000000" : "#B0B8BF",
    opacity: isDisabled ? 0.5 : isActive ? 1 : 0.7,
    fontWeight: isActive ? 700 : 500,

    "&:hover": {
      opacity: !isDisabled && !isActive ? 1 : undefined,
    },
  }),
);

const activePillStyles = {
  position: "absolute" as const,
  top: "6px",
  left: "6px",
  bottom: "3px",
  height: "calc(100% - 9px)",
  backgroundColor: "#9AC2FA",
  borderRadius: "24px",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  zIndex: 0,
};

const sizeMap = {
  small: {
    fontSize: "0.8125rem",
    padding: [0.5, 1.5],
    containerPadding: 0.25,
  },
  medium: {
    fontSize: "17px",
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
  const theme = useTheme();
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

      const newDimensions = {
        width: activeRect.width,
        x: activeRect.left - containerRect.left,
      };

      setPillDimensions(newDimensions);
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
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <BackgroundEffect
        width="80vw"
        height="90px"
        blur={50}
        fadeEdges={["right"]}
        style={
          theme.palette.mode === "dark"
            ? undefined
            : { backgroundColor: "#232B2FCC" }
        }
      />
      <Container
        ref={containerRef}
        role="tablist"
        sx={{
          width: fullWidth ? "100%" : "auto",
          p: sizeConfig.containerPadding,
          ...sx,
        }}
      >
        {pillDimensions.width > 0 && (
          <motion.div
            style={activePillStyles}
            animate={{
              x: pillDimensions.x,
              width: pillDimensions.width,
            }}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 30,
            }}
          />
        )}

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
    </Box>
  );
};
