# Dash Day Dave OS: Features & Future Dual-Role Roadmap

This document serves as an exhaustive log of the clinical features currently implemented within **Dash Day Dave OS**, alongside a structured blueprint of features planned to facilitate collaborative clinical workflows between patients and their healthcare providers.

---

## 1. Implemented Clinical Features

The current architecture has been upgraded to replace unstructured, high-arousal gamification with evidence-based cognitive scaffolding designed to reduce cognitive load and support executive function.

### A. Flat Architecture & Cross-Tracker Focus Integration
* **Mechanism:** Every action item across all specialized modules (Academic Tracker, Build Tracker, Project Tracker, CommandCenter, Kidaura, and Logs) contains a direct, single-click link (`Shield` trigger) to launch a focused session.
* **Clinical Rationale:** Eliminates the cognitive drift and multi-nested navigation pathways that trigger attentional abandonment in users with severe working memory deficits (Spiel et al., 2018).

### B. Pre-Session Box-Breathing (TPN Activation) Mode
* **Mechanism:** Before the active focus countdown commences, the system triggers an immersive, visually guided 4-step box-breathing cycle (4s Inhale, 4s Hold, 4s Exhale, 4s Hold).
* **Clinical Rationale:** Suppresses hyper-arousal within the Default Mode Network (DMN) and physically triggers parasympathetic vagal stimulation, stabilizing heart rate variability to prepare the brain for Task-Positive Network (TPN) engagement (Sonuga-Barke & Castellanos, 2007).

### C. In-Session Acoustic Pacer
* **Mechanism:** A low-frequency (150Hz) suppressive metronome toggle with adjustable time intervals.
* **Clinical Rationale:** Serves as an ecological momentary auditory beacon to gently anchor attention during involuntary micro-lapses in focus without triggering sudden, startling sensory overload (Sweller, 1988).

### D. ADHD Chronobiology Suite (Circadian Phase Monitor)
* **Mechanism:**
  * Interactive tracking of sleep onset stability and wake times.
  * Real-time calculation of the **Sleep Midpoint Deviation** relative to the target biomarker of 3:30 AM (the standard circadian baseline).
  * Direct correlation mapping in an interactive trend chart, plotting daily subjective focus ratings against bedtime stability over a rolling 7-day window.
* **Clinical Rationale:** Delays in circadian phase and sleep-onset insomnia are core clinical comorbidities of ADHD. Providing a structured visual loop helps patients correlate sleep midpoint shifts with actual daytime executive function.

---

## 2. Planned Future Features (Clinical Dual-Role Roadmap)

To transform this system into a collaborative therapeutic platform, future updates will establish two distinct user environments (roles): the **Patient Client** and the **Clinician Portal**.

### Role A: The Patient Client (Ecological Momentary Assessment)
In this workspace, the patient records daily ecological, behavioral, and biological telemetry:

1. **WHO ASRS-v1.1 screener Integration**
   * *Description:* Standardized 6-question Adult ADHD Self-Report Scale administered on a weekly cadence inside the app.
   * *Utility:* Generates an objective, clinical symptom severity index that maps directly against their behavioral metrics (e.g., focus completion rate and sleep consistency).
2. **Treatment & Medication Adherence Log**
   * *Description:* A silent, non-invasive log tracking pharmacological protocols (stimulants vs. non-stimulants), active dose times, and therapeutic dosage windows.
   * *Utility:* Visualizes the "effective active windows" of medications, detecting active coverage periods and potential wear-off periods (rebound symptoms) to guide dosage titration.
3. **Daily Executive Resistance Check-ins**
   * *Description:* Qualitative micro-prompts triggered upon completion of each Focus Shield session: *"Rate your mental resistance during this block (1-5)"*.

### Role B: The Clinician Portal (Objective Review & Telemetry)
A secure, password-protected portal allowing psychiatrists, neurologists, and clinical psychologists to evaluate patient compliance and treatment efficacy:

1. **Standardized Clinician Export Module**
   * *Description:* Generates highly detailed, print-ready PDFs and standardized CSV data files of the patient’s behavioral metrics (mean daily focus duration, task slicing rates, sleep onset deviation, and medication compliance).
   * *Utility:* Maximizes clinical consult efficiency. Clinicians are equipped with long-term, high-fidelity ecological momentary assessment (EMA) data instead of relying on the patient’s subjective retrospective recall, which is often distorted by executive dysfunction.
2. **Behavioral Trend Correlation Engine**
   * *Description:* Advanced analytical charts displaying the interaction between medication timing, sleep midpoint stability, and completed daily priorities.
3. **Dynamic CBT Goal-Slicing Scaffolds**
   * *Description:* Allows clinicians to remotely or collaboratively prescribe specific daily cognitive exercises and sub-step "slicing templates" tailored to the patient’s diagnostic profile.
