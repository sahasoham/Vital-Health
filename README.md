# Vital Sleep Patch — AMC Revenue Upside Calculator

An interactive, single-page web app for Academic Medical Center (AMC) sleep clinic administrators to estimate the incremental revenue opportunity from adopting the **Vital Sleep Patch** — a pediatric at-home OSA diagnostic device.

Built for use in live Zoom calls with hospital administrators or as a self-serve tool.

---

## What It Does

The Vital Sleep Patch creates a **parallel diagnostic pathway** for children already on the PSG waitlist. Existing in-lab studies continue at full capacity — Vital simply unlocks revenue from patients who would otherwise wait months for a diagnosis.

The calculator walks through two input screens and produces a projected revenue upside across four streams:

| Revenue Stream | Driver |
|---|---|
| Physician interpretation | Per Vital test read |
| Follow-up consults | Per diagnosed patient |
| Downstream treatment | T&A surgery, PAP titration, etc. |
| Ongoing monitoring | Multi-year follow-up per patient |

---

## How to Use

No installation or server required. Just open `index.html` in any modern browser.

```
open index.html
```

Or clone the repo and open the file directly:

```bash
git clone https://github.com/sahasoham/Vital-Health.git
cd Vital-Health
open index.html   # macOS
start index.html  # Windows
```

---

## Screens

1. **Your Lab Today** — Enter your annual PSG volume, waitlist size, and home-test eligibility rate
2. **Revenue Inputs** — Enter interpretation fees, consult fees, referral rates, treatment revenue, and monitoring revenue
3. **Results** — Headline total, insight pills, a Chart.js bar chart, and a line-item breakdown table

---

## Stack

- Vanilla HTML / CSS / JavaScript — no build step, no dependencies to install
- [Chart.js](https://www.chartjs.org/) via CDN for the revenue breakdown chart
- [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts

---

## Default Assumptions

| Input | Default |
|---|---|
| Annual pediatric PSG volume | 1,000 |
| Waitlist length | 500 patients |
| Home-test eligibility rate | 60% |
| Interpretation fee | $200 / test |
| Follow-up consult | $300 / patient |
| Downstream referral rate | 60% |
| Avg. treatment revenue | $4,000 / patient |
| Annual monitoring revenue | $250 / patient |
| Years modeled | 3 |

All defaults are editable in the app.

---

## Example Output (default inputs)

- Vital tests/year: **300**
- Total revenue upside: **$1,095,000**

---

*Estimates are illustrative. Actual results will vary based on payer mix, reimbursement timelines, and clinical workflows.*
