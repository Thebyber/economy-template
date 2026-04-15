import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { useMinigameSession } from "lib/portal";
import { DeepDungeonHome } from "./DeepDungeonHome";
import { DeepDungeonGamePage } from "./DeepDungeonGamePage";

const ApiErrorModal: React.FC = () => {
  const { apiError, clearApiError } = useMinigameSession();
  if (!apiError) return null;
  return (
    <Modal show>
      <Panel>
        <div className="p-2">
          <Label type="danger">Error</Label>
          <span className="text-sm my-2 block">{apiError}</span>
        </div>
        <Button onClick={clearApiError}>Close</Button>
      </Panel>
    </Modal>
  );
};

export const DeepDungeonRoutes: React.FC = () => {
  return (
    <>
      <ApiErrorModal />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<DeepDungeonHome />} />
        <Route path="/game" element={<DeepDungeonGamePage />} />
      </Routes>
    </>
  );
};
