---
badges:
  Brawls/FBS_400kg.png:
    name: "FBS_400kg"
    achieved: "2025-08-23"
  Brawls/C2Ctrail.png:
    name: "Singapore Coast to Coast trail 40km"
    achieved: "2025-08-09"
  Brawls/ironmanBangsean_20.png:
    name: "Ironman Bangsean"
    achieved: "2020-02-23"
  Brawls/GunungLedang.png:
    name: "Gunung Ledang"
    achieved: "2025-10-19"
  Brains/UPSR.png:
    name: "UPSR 7A"
    achieved: "2012"
  Brains/XJ.png:
    name: "Sin Chew Daily Student Reporter"
    achieved: "2015"
  Brains/SPM.png:
    name: "SPM 10A"
    achieved: "2017"
  Brains/STPM.png:
    name: "STPM 4.00"
    achieved: "2019"
  Brains/NTU.png:
    name: "NTU EEE Valedictorian"
    achieved: "2024"
  Brains/MicronJuniorEngineer.png:
    name: "Micron Junior Engineer"
    achieved: "2024-08-19"
---

# Checkpoint badges

Each key is an image path relative to this folder. The Brains or Brawls subfolder
sets the category. `name` is the displayed title; `achieved` is a quoted year,
month, or full date (`YYYY`, `YYYY-MM`, or `YYYY-MM-DD`). Keep the original date
precision. Dates sort newest first within each category.

An achievement date marks a badge as earned, even before its story is written.
To nest a story beneath a badge, use its relative image path in the post header:
`badges: ["Brains/NTU.png"]`. Only published life checkpoint posts are linked.
