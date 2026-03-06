# Design Document: Navigation Refactoring & Birthday/Legend Template

**Date:** 2026-03-06  
**Status:** Approved  
**Author:** Antigravity (Assistant)

## 1. Problem Statement

With 22+ tools, the current horizontal navigation bar is cluttered, overflowing, and hard to use. Additionally, the user wants a premium "Birthday/Legend" template that is missing from the current suite.

## 2. Navigational Refactoring (Option A - Categories)

### 2.1. Objective

Group related tools together to clean up the UI while keeping everything accessible.

### 2.2. Proposed Architecture

Replacement of individual `tab-btn` elements with 4 primary category dropdowns:

- **🏆 MATCH DAY**: Goal, Lineup, Squad, Preview, Live Score, Summary, Cards, H2H, Prediction, Calendar, Ratings.
- **👤 PLAYERS**: **Birthday (New)**, MOTM, Hat-trick, Transfers, Records, Absents.
- **📊 ANALYSE**: Table, Stats, Polls.
- **🎙️ MÉDIA**: Quotes, Comunicados, Watermark.

### 2.3. Technical Implementation

- **HTML**: Use a structure where each category is a button that reveals a list of links (or smaller buttons) on hover/click.
- **CSS**: Implement a CSS-driven dropdown system with `:hover` for desktop and a small JS toggle for mobile compatibility.
- **Persistence**: Maintain current `localStorage` logic for the active tab, ensuring the dropdown stays highlighted if one of its items is selected.

---

## 3. Birthday/Legend Template (Focus: Heritage)

### 3.1. Visual Design

- **Theme**: "Heritage/Legend" - Premium, elegant, and timeless.
- **Colors**: Royal dark gradient background (#000b21 to #000) with a golden radial glow behind the player.
- **Typography**:
  - Player Name: `Playfair Display` (Serif).
  - Age/Dates: `Bebas Neue` with golden gradient.
- **Layout**: Center-aligned player image with big numbers trailing behind them.

### 3.2. Data Model & Inputs

- **Mode Switcher**: Toggle between "Birthday" (Age) and "Legacy" (Years).
- **Fields**:
  - `player-name`: Text input.
  - `player-age-years`: Text input (dynamic label).
  - `message-text`: Custom birthday message.
  - `image-upload`: Professional player photo (compatible with current compression logic).

---

## 4. UI/UX Considerations

- **Responsive**: The new categories must collapse gracefully on mobile.
- **Consistency**: The new template will support both "Story Mode" (9:16) and "Post" (1:1) through the global settings.

## 5. Success Criteria

1.  Navigation bar contains exactly 4 categories + Home + Guide + Settings.
2.  Birthday template is functional and matches the "Heritage" premium style.
3.  All settings (new fields) are persisted in `localStorage`.
