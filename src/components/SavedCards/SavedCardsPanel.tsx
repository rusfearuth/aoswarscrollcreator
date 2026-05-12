import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, DriveFileRenameOutline, Save } from "@mui/icons-material";
import { RootState } from "../../store/store";
import { SavedCard } from "./SavedCardsSlice";
import {
  useDeleteSlot,
  useLoadSlot,
  useOverwriteSlot,
  useRenameSlot,
  useSaveCurrentAsNewSlot,
} from "./SavedCardsHooks";

type ConfirmKind = "load" | "delete" | "overwrite";

const SavedCardsPanel: React.FC = () => {
  const cards = useSelector((state: RootState) => state.savedCards.cards);
  const defaultName = useSelector((state: RootState) => state.characteristics.warscrollName);

  const saveAsNew = useSaveCurrentAsNewSlot();
  const overwrite = useOverwriteSlot();
  const loadSlot = useLoadSlot();
  const renameSlot = useRenameSlot();
  const deleteSlot = useDeleteSlot();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const [renameTarget, setRenameTarget] = useState<SavedCard | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [confirm, setConfirm] = useState<{ card: SavedCard; kind: ConfirmKind } | null>(null);

  const openSaveDialog = () => {
    setSaveName(defaultName || "");
    setSaveDialogOpen(true);
  };

  const handleSave = () => {
    saveAsNew(saveName.trim());
    setSaveDialogOpen(false);
  };

  const handleRename = () => {
    if (renameTarget && renameValue.trim()) {
      renameSlot(renameTarget.id, renameValue.trim());
    }
    setRenameTarget(null);
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === "load") loadSlot(confirm.card);
    if (confirm.kind === "delete") deleteSlot(confirm.card.id);
    if (confirm.kind === "overwrite") overwrite(confirm.card.id);
    setConfirm(null);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  const confirmMessage = (kind: ConfirmKind, name: string): string => {
    switch (kind) {
      case "load":
        return `Replace current warscroll with "${name}"? You may want to save current state first.`;
      case "delete":
        return `Delete saved slot "${name}"? This cannot be undone.`;
      case "overwrite":
        return `Overwrite slot "${name}" with the current warscroll state?`;
    }
  };

  return (
    <Box>
      <Box sx={{ p: 1 }}>
        <Button fullWidth variant="outlined" onClick={openSaveDialog}>
          Save current as new slot
        </Button>
      </Box>
      {cards.length === 0 ? (
        <Typography variant="body2" sx={{ p: 1, opacity: 0.7 }}>
          No saved warscrolls yet.
        </Typography>
      ) : (
        <List dense>
          {cards.map((card) => (
            <ListItem
              key={card.id}
              disablePadding
              secondaryAction={
                <Stack direction="row" spacing={0}>
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label="overwrite"
                    onClick={() => setConfirm({ card, kind: "overwrite" })}
                  >
                    <Save fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label="rename"
                    onClick={() => {
                      setRenameValue(card.name);
                      setRenameTarget(card);
                    }}
                  >
                    <DriveFileRenameOutline fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label="delete"
                    onClick={() => setConfirm({ card, kind: "delete" })}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemButton onClick={() => setConfirm({ card, kind: "load" })}>
                <ListItemText
                  primary={card.name}
                  secondary={formatDate(card.updatedAt)}
                  primaryTypographyProps={{ sx: { fontSize: "0.875rem" } }}
                  secondaryTypographyProps={{ sx: { fontSize: "0.75rem" } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save current warscroll</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Slot name"
            fullWidth
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameTarget !== null} onClose={() => setRenameTarget(null)}>
        <DialogTitle>Rename slot</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New name"
            fullWidth
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameTarget(null)}>Cancel</Button>
          <Button onClick={handleRename} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirm !== null} onClose={() => setConfirm(null)}>
        <DialogTitle>
          {confirm?.kind === "delete"
            ? "Delete slot"
            : confirm?.kind === "overwrite"
            ? "Overwrite slot"
            : "Load slot"}
        </DialogTitle>
        <DialogContent>
          <Typography>{confirm && confirmMessage(confirm.kind, confirm.card.name)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={confirm?.kind === "delete" ? "warning" : "primary"}
          >
            {confirm?.kind === "delete" ? "Delete" : confirm?.kind === "overwrite" ? "Overwrite" : "Load"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedCardsPanel;
