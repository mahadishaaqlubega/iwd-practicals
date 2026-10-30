# IWD Practicals: Experiments 2 and 3

Course: 01AL0501 Intelligent Web Designing  
Department: BS - AI ML & DS, Faculty of Technology, Marwadi University  
Student: Lubega Mahad Ishaaq (92400198030)

Live demo: https://mahadishaaqlubega.github.io/iwd-practicals/

## Experiments

| No. | Title | Folder |
|-----|-------|--------|
| 2 | Responsive UI that updates text from user input (Lab Pass Studio) | [`experiment-2/`](experiment-2/) |
| 3 | Line and bar chart dashboard with Chart.js (The Sales Ledger) | [`experiment-3/`](experiment-3/) |

### Experiment 2: Lab Pass Studio
A form on the left and a lab pass on the right. As the user types:

- the large headline greets the user by first name
- the pass fills in name, initials, enrollment number, department, semester, headline and bio, and draws a barcode from the enrollment digits
- each field is checked and shows a pass or fail message under it
- a meter shows how complete the pass is
- character, word and reading-time counts update, and a change log lists the last five edits

It also has accent colour and name-style controls, a light/dark theme, and a layout that stacks into one column on small screens.

### Experiment 3: The Sales Ledger
Uses the sample dataset from the practical sheet (Jan to Jun sales and orders).

- Line chart for the trend, with sales and orders on separate y-axes
- Bar chart comparing both series by month (vertical or horizontal)
- Headline figures: total sales, total orders, sales per order and growth
- Statistics table: total, mean, median, highest, lowest, range and standard deviation, plus the sales/orders correlation
- Period filter (Jan to Mar, Apr to Jun, all months)
- A form to add the next month and a simulated live feed
- Titles, legends and tooltips on both charts; charts resize with the window

## Tools
HTML5, CSS3, JavaScript (no frameworks), Chart.js 4.4.1 from the jsDelivr CDN, Visual Studio Code.

Fonts: TeX Gyre Pagella and TeX Gyre Heros, stored in `assets/fonts` (GUST Font License).

## Running locally
Open `index.html` in any modern browser. Experiment 3 needs an internet connection the first time so Chart.js can load from the CDN.
