import React from "react";
import { Label } from "components/ui/Label";

const Key: React.FC<{ children: React.ReactNode; wide?: boolean }> = ({ children, wide }) => (
  <div
    className="flex items-center justify-center font-bold text-brown-1100 bg-[#e4a672] rounded-sm select-none"
    style={{
      border: "2px solid #754733",
      boxShadow: "0 3px 0 #754733",
      fontSize: 10,
      minWidth: wide ? 56 : 28,
      height: 28,
      padding: "0 4px",
    }}
  >
    {children}
  </div>
);

export const HomeControls: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-3 p-3">
      <Label type="info" className="uppercase">Move</Label>

      {/* Keyboard layout */}
      <div className="flex flex-col items-center gap-1">
        {/* W / Up */}
        <div className="flex gap-1 justify-center">
          <Key>W</Key>
          <Key>▲</Key>
        </div>
        {/* A S D / Left Down Right */}
        <div className="flex gap-1 justify-center">
          <Key>A</Key>
          <Key>S</Key>
          <Key>D</Key>
          <Key>◄</Key>
          <Key>▼</Key>
          <Key>►</Key>
        </div>
      </div>

      <Label type="default" className="text-center">
        Mobile version: Swipe to move, mine, or attack
      </Label>

      <Label type="warning" className="text-center">
        To attack an enemy or mine a crystal, you must move toward it.
      </Label>
    </div>
  );
};
