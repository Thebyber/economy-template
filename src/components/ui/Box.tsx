import React from "react";
import classNames from "classnames";
import Decimal from "decimal.js-light";
import { pixelDarkBorderStyle } from "lib/style";
import { PIXEL_SCALE } from "lib/constants";
import { Label } from "./Label";
import { SUNNYSIDE } from "assets/ui/sunnyside";

const INNER = 14;

/** Compact inventory-style tile used by Chicken Rescue HUD (subset of main-game Box). */
export const Box: React.FC<{
  image: string;
  count?: Decimal;
  showCountIfZero?: boolean;
  hideCount?: boolean;
  fillImage?: boolean;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
  parentDivRef?: React.Ref<HTMLDivElement>;
}> = ({
  image,
  count,
  showCountIfZero,
  hideCount,
  fillImage,
  className,
  onClick,
  isSelected,
  parentDivRef,
}) => {
  const showLabel =
    !hideCount &&
    count !== undefined &&
    (showCountIfZero ? count.gte(0) : count.gt(0));

  return (
    <div ref={parentDivRef} className={classNames("relative", className)}>
      <div
        className={classNames(
          "relative flex items-center justify-center bg-brown-600",
          onClick && "cursor-pointer hover:brightness-95",
        )}
        style={{
          width: `${PIXEL_SCALE * (INNER + 4)}px`,
          height: `${PIXEL_SCALE * (INNER + 4)}px`,
          marginTop: `${PIXEL_SCALE * 3}px`,
          marginBottom: `${PIXEL_SCALE * 2}px`,
          marginLeft: `${PIXEL_SCALE * 2}px`,
          marginRight: `${PIXEL_SCALE * 3}px`,
          ...pixelDarkBorderStyle,
        }}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <img
          src={image}
          alt=""
          className={fillImage ? "w-[85%] h-[85%] object-contain" : "max-w-[85%] max-h-[85%] object-contain"}
          draggable={false}
          style={{ imageRendering: "pixelated" }}
        />

        {showLabel && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              right: `${PIXEL_SCALE * -5}px`,
              top: `${PIXEL_SCALE * -5}px`,
            }}
          >
            <Label
              type="default"
              style={{
                paddingLeft: "2.5px",
                paddingRight: "1.5px",
                height: "24px",
              }}
            >
              {count.toString()}
            </Label>
          </div>
        )}
      </div>

      {/* SFL-style corner selection overlay — positioned on outer div like the main game */}
      {isSelected && (
        <>
          <img
            className="absolute pointer-events-none"
            src={SUNNYSIDE.ui.selectBoxTL}
            style={{ top: `${PIXEL_SCALE * 1}px`, left: `${PIXEL_SCALE * 0}px`, width: `${PIXEL_SCALE * 8}px` }}
            alt=""
          />
          {!showLabel && (
            <img
              className="absolute pointer-events-none"
              src={SUNNYSIDE.ui.selectBoxTR}
              style={{ top: `${PIXEL_SCALE * 1}px`, left: `${PIXEL_SCALE * INNER}px`, width: `${PIXEL_SCALE * 8}px` }}
              alt=""
            />
          )}
          <img
            className="absolute pointer-events-none"
            src={SUNNYSIDE.ui.selectBoxBL}
            style={{ top: `${PIXEL_SCALE * INNER}px`, left: `${PIXEL_SCALE * 0}px`, width: `${PIXEL_SCALE * 8}px` }}
            alt=""
          />
          <img
            className="absolute pointer-events-none"
            src={SUNNYSIDE.ui.selectBoxBR}
            style={{ top: `${PIXEL_SCALE * INNER}px`, left: `${PIXEL_SCALE * INNER}px`, width: `${PIXEL_SCALE * 8}px` }}
            alt=""
          />
        </>
      )}
    </div>
  );
};
