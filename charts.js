/* ============================================================
   CHART BANK — edit this file to add or change charts.
   Each entry needs: id, title, image, prompt.
   To add a new one: drop the image in charts/, add an entry
   below pointing at it. Nothing else needs to change.
   ============================================================ */

window.CHART_BANK = [
  {
    id: "factory-workers-germany",
    title: "Factory workers in Germany, 1851–1901",
    image: "charts/factory-workers-germany.jpg",
    prompt: "The following table shows the number of factory workers for a given time period in Germany. Report the main features and make comparisons where relevant.",
    data: "Table data — Year: Male employees, Female employees, Total employees, Factories. 1851: 287,100 / 190,000 / 477,100 / 225. 1861: 131,780 / 160,000 / 291,780 / 227. 1871: 80,123 / 60,000 / 140,123 / 622. 1881: 76,132 / 50,000 / 126,132 / 721. 1891: 65,000 / 40,000 / 105,000 / 625. 1901: 31,000 / 30,000 / 61,000 / 600."
  },
  {
    id: "co2-emissions",
    title: "CO2 emissions per person, four countries, 1967–2007",
    image: "charts/co2-emissions.png",
    prompt: "The graph below shows average carbon dioxide (CO2) emissions per person in the United Kingdom, Sweden, Italy and Portugal between 1967 and 2007. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    data: "Line graph, CO2 emissions in metric tonnes per person. UK: 1967 ~10.8, 1977 ~10.7, 1987 ~10.0, 1997 ~9.2, 2007 ~8.6 (steady decline throughout). Sweden: 1967 ~8.5, 1977 ~10.2, 1987 ~6.4, 1997 ~6.4, 2007 ~5.3 (rose then fell sharply). Italy: 1967 ~4.2, 1977 ~6.4, 1987 ~6.9, 1997 ~7.6, 2007 ~7.7 (steady rise, then plateau). Portugal: 1967 ~1.0, 1977 ~1.8, 1987 ~2.6, 1997 ~3.8, 2007 ~5.3 (steady rise throughout, lowest start, converges near Sweden by 2007)."
  },
  {
    id: "hospital-admissions",
    title: "Weekly hospital admissions, five hospitals, 2004–2018",
    image: "charts/hospital-admissions.jpg",
    prompt: "The graph below shows the hospital admissions for five hospitals in a European country from 2004 to 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    data: "Weekly hospital admissions. Bardley: highest throughout, 2004 ~200 rising steadily to 2018 ~270 (dip to ~240 in 2014). Fortsmith: 2004 ~180 rising to a peak ~220 in 2010, then declining to ~200 by 2018. Adlin: 2004 ~120, dips slightly then climbs steadily from 2010 to reach ~250 by 2018, overtaking Fortsmith and nearly matching Bardley. Stanton: 2004 lowest at ~80, rises to ~145 by 2012, fluctuates, ends ~160 in 2018. Oxley: 2004 highest of all at ~240, declines sharply and erratically to lowest of all at ~110 by 2018 — the only clear downward trend."
  },
  {
    id: "aluminium-recycling",
    title: "The aluminium can recycling process",
    image: "charts/aluminium-recycling.jpg",
    prompt: "The diagram below shows the recycling process of aluminium cans. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    data: "Circular process diagram, 6 stages: (1) used cans collected from a public collection point, (2) collection by truck, (3) cleaning, sorting, shredding and compressing at a facility, (4) heating and melting, (5) rolling into sheets 2.5mm-6mm thick, (6) reusing to manufacture new cans — 74% of cans recycled in the UK. This is a cyclical process, not a linear one — stage 6 feeds back into new cans, not into stage 1 directly."
  },
  {
    id: "manchester-crime",
    title: "Crime in three areas of Manchester city centre, 2003–2012",
    image: "charts/manchester-crime.jpg",
    prompt: "The chart below shows the changes in three different areas of Manchester city centre from 2003-2012. Summarise the information by selecting and reporting the main features and making comparisons where relevant.",
    data: "Line graph, incidents per year, three categories. Burglary: 2003 ~3,350, peaks ~3,700 in 2004, falls sharply to ~1,050 by 2008 (lowest point), recovers to ~1,300-1,400 by 2012 — largest overall change, crosses below car theft around 2007. Car theft: 2003 ~2,200, relatively stable around 2,000-2,300 until 2008, then rises steadily to ~2,700 by 2012 — ends as the highest of the three, overtaking burglary. Robbery: consistently lowest throughout, fluctuating narrowly between ~450 and ~800, no clear trend, ends around 500 in 2012."
  }
];
