import React, { useRef, useEffect, useState } from "react";
import { Container, Box, useMediaQuery, Theme } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { resetDownload } from "./WarscrollCardSlice";
import { setModelImagePosition } from "../ModelImage/ModelImageSlice";

const CANVAS_WIDTH = 658;
const CANVAS_HEIGHT = 995;

import {
  drawImageOnCanvas,
  drawText,
  drawAbilitiesOnCanvas,
  drawWarscrollTitleTextOnCanvas,
  drawWeaponsOnCanvas,
  drawLoadoutOnCanvas,
} from "./WarscrollUtils";

export interface Coordinate {
  x: number;
  y: number;
}

const WarscrollCard: React.FC = () => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const modelImageCanvasRef = useRef<HTMLCanvasElement>(null);
  const characteristicsCanvasRef = useRef<HTMLCanvasElement>(null);
  const bodyCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const modelImageRef = useRef<HTMLImageElement>(new Image());
  const weaponBannerImageRef = useRef<HTMLImageElement>(new Image());
  const dispatch = useDispatch();

  const triggerDownload = useSelector((state: RootState) => state.warscroll.triggerDownload);

  const factionTemplate = useSelector((state: RootState) => state.faction.factionTemplate);
  const factionWeaponBanner = useSelector((state: RootState) => state.faction.factionWeaponBanner);
  const factionName = useSelector((state: RootState) => state.faction.factionName);
  const customFactionName = useSelector((state: RootState) => state.faction.customFactionName);

  const warscrollName = useSelector((state: RootState) => state.characteristics.warscrollName);
  const warscrollSubtype = useSelector((state: RootState) => state.characteristics.warscrollSubtype);

  const moveChar = useSelector((state: RootState) => state.characteristics.warscrollMove);
  const healthChar = useSelector((state: RootState) => state.characteristics.warscrollHealth);
  const saveChar = useSelector((state: RootState) => state.characteristics.warscrollSave);
  const controlChar = useSelector((state: RootState) => state.characteristics.warscrollControl);

  const keywordIdentities = useSelector((state: RootState) => state.keywords.keywordIdentities);
  const keywordAbilities = useSelector((state: RootState) => state.keywords.keywordAbilities);

  const meleeWeapons = useSelector((state: RootState) => state.weapons.meleeWeaponStats);
  const rangedWeapons = useSelector((state: RootState) => state.weapons.rangedWeaponStats);

  const abilities = useSelector((state: RootState) => state.abilities.abilities);

  const loadoutBody = useSelector((state: RootState) => state.loadout.body);
  const loadoutPoints = useSelector((state: RootState) => state.loadout.points);

  const modelImageData = useSelector((state: RootState) => state.modelImage.imageData);
  const modelImageX = useSelector((state: RootState) => state.modelImage.x);
  const modelImageY = useSelector((state: RootState) => state.modelImage.y);
  const modelImageWidth = useSelector((state: RootState) => state.modelImage.width);
  const modelImageHeight = useSelector((state: RootState) => state.modelImage.height);
  const modelImageOpacity = useSelector((state: RootState) => state.modelImage.opacity);

  const customization = useSelector((state: RootState) => state.customization);
  const charFontSize = customization.fontSizes.characteristics;
  const charReducedFontSize = Math.max(1, Math.round(charFontSize * 0.76));
  const keywordsFontSize = customization.fontSizes.keywords;

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const dragStateRef = useRef<{ active: boolean; offsetX: number; offsetY: number }>({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const getCanvasCoords = (clientX: number, clientY: number, rect: DOMRect) => ({
    x: ((clientX - rect.left) * CANVAS_WIDTH) / rect.width,
    y: ((clientY - rect.top) * CANVAS_HEIGHT) / rect.height,
  });

  const isInsideModelImage = (x: number, y: number) =>
    x >= modelImageX &&
    x <= modelImageX + modelImageWidth &&
    y >= modelImageY &&
    y <= modelImageY + modelImageHeight;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!modelImageData || e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = getCanvasCoords(e.clientX, e.clientY, rect);
    if (!isInsideModelImage(x, y)) return;
    dragStateRef.current = {
      active: true,
      offsetX: x - modelImageX,
      offsetY: y - modelImageY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = getCanvasCoords(e.clientX, e.clientY, rect);
    dispatch(
      setModelImagePosition({
        x: Math.round(x - dragStateRef.current.offsetX),
        y: Math.round(y - dragStateRef.current.offsetY),
      })
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (triggerDownload) {
      const backgroundCanvas = backgroundCanvasRef.current;
      const modelImageCanvas = modelImageCanvasRef.current;
      const characteristicsCanvas = characteristicsCanvasRef.current;
      const bodyCanvas = bodyCanvasRef.current;

      if (backgroundCanvas && modelImageCanvas && characteristicsCanvas && bodyCanvas) {
        const link = document.createElement("a");
        const backgroundCtx = backgroundCanvas.getContext("2d");
        const modelImageCtx = modelImageCanvas.getContext("2d");
        const characteristicsCtx = characteristicsCanvas.getContext("2d");
        const bodyCtx = bodyCanvas.getContext("2d");

        const combinedCanvas = document.createElement("canvas");
        combinedCanvas.width = backgroundCanvas.width;
        combinedCanvas.height = backgroundCanvas.height;
        const combinedCtx = combinedCanvas.getContext("2d");

        if (combinedCtx && backgroundCtx && modelImageCtx && characteristicsCtx && bodyCtx) {
          combinedCtx.drawImage(backgroundCanvas, 0, 0);
          combinedCtx.drawImage(modelImageCanvas, 0, 0);
          combinedCtx.drawImage(characteristicsCanvas, 0, 0);
          combinedCtx.drawImage(bodyCanvas, 0, 0);
          link.href = combinedCanvas.toDataURL("image/png");
          link.download = warscrollName + "_Warscroll.png";
          link.click();
        }
      }
      dispatch(resetDownload());
    }
  }, [triggerDownload, dispatch, warscrollName]);

  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const backgroundCtx = backgroundCanvas?.getContext("2d");
    const image = imageRef.current;

    image.src = factionTemplate;

    image.onload = () => {
      if (backgroundCtx && backgroundCanvas) {
        backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        drawImageOnCanvas(backgroundCtx, image, backgroundCanvas);
      }
    };
  }, [factionTemplate]);

  useEffect(() => {
    const canvas = modelImageCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!modelImageData) return;

    const img = modelImageRef.current;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = modelImageOpacity;
      ctx.drawImage(img, modelImageX, modelImageY, modelImageWidth, modelImageHeight);
      ctx.globalAlpha = 1;
    };

    if (img.src === modelImageData && img.complete && img.naturalWidth > 0) {
      draw();
    } else {
      img.onload = draw;
      img.src = modelImageData;
    }
  }, [modelImageData, modelImageX, modelImageY, modelImageWidth, modelImageHeight, modelImageOpacity]);

  useEffect(() => {
    const characteristicsCanvas = characteristicsCanvasRef.current;
    const characteristicsCtx = characteristicsCanvas?.getContext("2d");

    if (characteristicsCtx && characteristicsCanvas) {
      characteristicsCtx.clearRect(0, 0, characteristicsCanvas.width, characteristicsCanvas.height);

      let factionTitle = factionName;
      if (customFactionName != null) {
        if (customFactionName.length > 0) factionTitle = customFactionName;
      }
      // Draw title
      drawWarscrollTitleTextOnCanvas(
        characteristicsCtx,
        "• " + factionTitle.toUpperCase() + " WARSCROLL •",
        warscrollName.toUpperCase(),
        warscrollSubtype.toUpperCase(),
        115
      );
      // Draw characteristics
      if (moveChar.length > 3) {
        drawText(characteristicsCtx, moveChar + '"', 107, 76, charReducedFontSize, "center", "white");
      } else {
        drawText(characteristicsCtx, moveChar + '"', 106, 80, charFontSize, "center", "white");
      }

      drawText(characteristicsCtx, controlChar, 104, 147, charFontSize, "center", "white");
      drawText(characteristicsCtx, healthChar, 74, 115, charFontSize, "center", "white");
      drawText(characteristicsCtx, saveChar, 137, 115, charFontSize, "center", "white");

      // Draw Keywords
      drawText(
        characteristicsCtx,
        keywordAbilities.join(", ").toUpperCase(),
        characteristicsCtx.canvas.width / 2,
        932,
        keywordsFontSize,
        "center",
        "#000000"
      );
      characteristicsCtx.save();
      drawText(
        characteristicsCtx,
        keywordIdentities.join(", ").toUpperCase(),
        characteristicsCtx.canvas.width / 2,
        960,
        keywordsFontSize,
        "center",
        "#000000"
      );
      characteristicsCtx.save();
    }
  }, [
    customFactionName,
    factionName,
    warscrollName,
    warscrollSubtype,
    moveChar,
    healthChar,
    controlChar,
    saveChar,
    keywordAbilities,
    keywordIdentities,
    charFontSize,
    charReducedFontSize,
    keywordsFontSize,
  ]);

  useEffect(() => {
    const bodyCanvas = bodyCanvasRef.current;
    const bodyCtx = bodyCanvas?.getContext("2d");
    const weaponBannerImage = weaponBannerImageRef.current;

    weaponBannerImage.src = factionWeaponBanner;

    const coords: Coordinate[] = [{ x: 0, y: 0 }];

    weaponBannerImage.onload = () => {
      if (bodyCtx && bodyCanvas) {
        bodyCtx.clearRect(0, 0, bodyCanvas.width, bodyCanvas.height);

        // Draw Weapons
        coords[0].y = drawWeaponsOnCanvas(
          bodyCtx,
          weaponBannerImage,
          rangedWeapons,
          meleeWeapons,
          customization
        );
        bodyCtx.save();

        // If we have a loadout, push a new element in our display and draw our loadout.
        const hasLoadout = loadoutBody.length > 0;
        if (hasLoadout) {
          const newCoordinate: Coordinate = { x: 0, y: coords[0].y };
          coords.push(newCoordinate);

          coords[0].y = drawLoadoutOnCanvas(
            bodyCtx,
            loadoutBody,
            loadoutPoints,
            coords[0].y,
            300,
            customization
          );
          bodyCtx.save();
        }

        drawAbilitiesOnCanvas(
          bodyCtx,
          bodyCanvas,
          abilities,
          coords,
          hasLoadout,
          loadoutPoints.length,
          customization
        );
        bodyCtx.save();
      }
    };
  }, [factionWeaponBanner, rangedWeapons, meleeWeapons, loadoutBody, loadoutPoints, abilities, customization]);

  return (
    <Box component="main" className="sticky-canvas">
      <Container style={{ overflowY: "auto", display: "flex" }}>
        <Box
          style={{
            position: "relative",
            width: "658px",
            height: "995px",
            cursor: modelImageData ? (isDragging ? "grabbing" : "grab") : "default",
            touchAction: modelImageData ? "none" : undefined,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <canvas
            ref={backgroundCanvasRef}
            className="sticky-canvas"
            width={658}
            height={995}
            style={{
              height: isMobile ? "70vh" : "100vh",
              width: isMobile ? "49vh" : "70vh",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <canvas
            ref={modelImageCanvasRef}
            className="sticky-canvas"
            width={658}
            height={995}
            style={{
              height: isMobile ? "70vh" : "100vh",
              width: isMobile ? "49vh" : "70vh",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <canvas
            ref={characteristicsCanvasRef}
            className="sticky-canvas"
            width={658}
            height={995}
            style={{
              height: isMobile ? "70vh" : "100vh",
              width: isMobile ? "49vh" : "70vh",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <canvas
            ref={bodyCanvasRef}
            className="sticky-canvas"
            width={658}
            height={995}
            style={{
              height: isMobile ? "70vh" : "100vh",
              width: isMobile ? "49vh" : "70vh",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default WarscrollCard;
