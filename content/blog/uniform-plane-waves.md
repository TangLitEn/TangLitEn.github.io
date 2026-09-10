---
title: "Uniform plane waves: an interactive exploration"
date: "2026-09-10"
tags: ["Engineering", "Learning"]
description: "What happens when a wave meets a boundary? Change the angle, materials, and polarization to explore reflection and refraction."
draft: false
checkpoint: false
---

This visualizer began as a C++ terminal project for Engineering Electromagnetics (EE3001) at NTU in 2022. The experiment below brings that sketch into this notebook, with live reflection, refraction, and power calculations.

::: simulation uniform-plane-waves
:::

## Things to try

- **Air → glass:** the transmitted ray bends toward the normal. Change the incident angle and watch the power split change.
- **Glass → air:** increase the angle beyond about 41.81° to see total internal reflection.
- **Brewster’s angle:** with p polarization, the reflected power falls to zero. Switch to s polarization at the same angle to see the difference.
- **Matching media:** set both refractive indices to the same value. The wave continues straight through without reflection.

Use **Copy experiment link** to share the current parameters, or **Reset** to return to the air-to-glass example. **Pause motion** stops the moving dots while keeping the controls active.

## Reading the diagram

The vertical line separates the two media. The dashed horizontal line is the **normal**, perpendicular to the boundary. Every angle is measured from that normal.

The green incident ray approaches the boundary; the dashed terracotta reflected ray stays in medium 1; the blue transmitted ray enters medium 2. Moving dots indicate travel direction, not oscillating electric or magnetic fields. The numbers below the diagram give the angles and power fractions.

At normal incidence, the incoming and reflected rays are slightly offset so both remain visible. Rays carrying zero power are omitted.

## Reflection and refraction

The reflected wave leaves at the same angle as the incident wave:

> θᵣ = θᵢ

Snell’s law relates the refractive indices to the incident and transmitted angles:

> n₁ sin θᵢ = n₂ sin θₜ

Entering a higher-index medium bends the transmitted ray toward the normal; entering a lower-index medium bends it away.

### When all the power comes back

When n₁ > n₂, there is a critical angle:

> θ꜀ = sin⁻¹(n₂ / n₁)

At this angle, the transmitted direction is tangent to the boundary and no power crosses it. Above this angle, total internal reflection occurs: R = 1 and T = 0. An evanescent field still exists in medium 2; it is not drawn here.

### How the power split is calculated

For lossless, nonmagnetic media, the Fresnel equations give the reflected power fraction R. With cᵢ = cos θᵢ and cₜ = cos θₜ:

> Rₛ = [(n₁cᵢ − n₂cₜ) / (n₁cᵢ + n₂cₜ)]²

> Rₚ = [(n₂cᵢ − n₁cₜ) / (n₂cᵢ + n₁cₜ)]²

Transmitted power is **T = 1 − R**. Unpolarized light uses the average of Rₛ and Rₚ. At Brewster’s angle, θᵦ = tan⁻¹(n₂ / n₁), p-polarized reflection vanishes.

These are power fractions, not electric-field amplitude coefficients. The s / TE and p / TM options describe the electric field perpendicular and parallel to the plane of incidence, respectively.

## Model and origins

The model assumes two homogeneous, isotropic, lossless, nonmagnetic media with positive, constant refractive indices and one flat interface. The material presets are illustrative constant-index examples; they do not model wavelength-dependent material data or absorption.

The original terminal sketch used C++ and an ASCII grid. This browser edition adds Snell’s law, Fresnel power calculations, and a responsive canvas. The interactive experiment runs here in the blog, entirely in your browser.

- [Physics of Light and Optics, chapter 3 — BYU](https://optics.byu.edu/docs/OpticsBook.pdf)
