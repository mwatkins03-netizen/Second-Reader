# Second Reader

A working demonstration of how a calibrated judgment model (Jev, from TypeSafe AI) could sit beside the staff and panels of a state arts agency. Built around the public programs of the South Carolina Arts Commission.

**Independent demonstration. Not affiliated with or endorsed by the South Carolina Arts Commission.**

## The rooms

| Room | What you do | Jev questions |
| --- | --- | --- |
| 01 Intake desk | Run eight eligibility checks on an application and set the certainty needed to skip a person | 8 yes/no |
| 02 Panel room | Score six rubric criteria yourself, then reveal Jev's spread across the bands | 6 scale |
| 03 Report room | Ask the same editable questions of every final report, export a CSV | up to 8 yes/no per report |
| 04 Applicant coach | Check a draft narrative against five rubric criteria, revise, compare attempts | 5 scale |
| 05 Collection desk | Tag a photograph, see a box around the main object, rate an image description | choice, yes/no, box, scale |

## Files

- `index.html` page shell, home page, disclosure page
- `styles.css` theme (indigo, rice paper, sweetgrass; Bricolage Grotesque and Newsreader; no italics)
- `data.js` all editable content: sample documents, checks, rubric bands, report questions, images
- `app.js` room logic and the Jev call

No build step. Deploy the folder as static files (GitHub Pages works; `.nojekyll` is included).

## Editing

Open `data.js`. Each room has its own block. Change a sample by editing its `text`. Change a check or criterion by editing `label` and `ask`. Keep each request to eight questions or fewer and each document under 5,800 characters.

## Connection

Requests go to the Jev Sandbox relay (`jev-sandbox-proxy.watkins-um.workers.dev`), a Cloudflare Worker that holds the TypeSafe key. Visitors can point the site at another relay from the Connection button in the header. The key is never in this folder.

## Disclosure

- Conceived and directed by Marc Watkins. Design, code, and text written with Claude, an AI system from Anthropic.
- Judgments in the rooms come from Jev (TypeSafe AI) and are labeled as such.
- Every sample application, draft, and final report is fictional and was written by AI for this demo. Organizations and people are invented. Counties are real.
- Grant names, rules, limits, and rubric criterion names and point ranges follow the Commission's published FY27 guidelines, retrieved November 13, 2026. Band descriptions are paraphrased, not official wording.
- Text typed into the rooms is sent to the relay and on to TypeSafe when a button is pressed. Do not paste real applications or personal information.
- Photographs load from Wikimedia Commons; credits and licenses are on the Disclosure page.

## Local preview

Box paths do not serve directly. Copy the folder to `/tmp/second-reader` and run `python3 -m http.server 8890` there (launch config `second-reader`).
