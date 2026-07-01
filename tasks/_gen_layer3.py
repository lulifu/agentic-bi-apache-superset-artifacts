#!/usr/bin/env python3
"""Generate Layer 3 (self-built NL2BI tasks) and append to nl2bi-benchmark.csv.

This script is the source of truth for Layer 3 task definitions. Edit it,
then re-run to regenerate the appended rows. The script is idempotent:
it reads the existing CSV, drops any rows whose id begins with `self_`,
then appends the freshly generated set.

Layer 3 covers four task classes against the BIRD `financial` schema:
- NL2Dashboard (10): build a multi-chart persistent dashboard for a stated audience
- NL2Analysis  (10): produce an evidence-backed analytical narrative
- NL2RCA       (10): identify a stated anomaly's primary contributors with drill-down
- (NL2Monitoring is folded into NL2RCA / NL2Analysis at request rather than as a
   separate class to keep the total at 30 and reduce schema-pivot per task.)

CSV column reference (matches Codex's Layer 1 / 2 rows):
  id, layer, class, nl_request, evidence, dataset, expected_dataset_id,
  expected_metrics, expected_dimensions, expected_filters, expected_time_range,
  expected_artifact_type, expected_viz_type, ground_truth_sql_sqlite,
  ground_truth_sql_starrocks, ground_truth_sql_postgres, ground_truth_vegalite,
  automatic_check, difficulty, notes
"""

import csv
import io
import os
from pathlib import Path

CSV_PATH = Path(__file__).parent / "nl2bi-benchmark.csv"

HEADERS = [
    "id", "layer", "class", "nl_request", "evidence", "dataset",
    "expected_dataset_id", "expected_metrics", "expected_dimensions",
    "expected_filters", "expected_time_range", "expected_artifact_type",
    "expected_viz_type", "ground_truth_sql_sqlite",
    "ground_truth_sql_starrocks", "ground_truth_sql_postgres",
    "ground_truth_vegalite", "automatic_check", "difficulty", "notes",
]

# ---------------------------------------------------------------------------
# Schema cheat sheet (from tasks/datasets/bird-financial-schema.md)
# ---------------------------------------------------------------------------
# trans (1,056,320 rows; date 1993-01-01..1998-12-31): trans_id, account_id,
#   date DATE, type {PRIJEM=credit, VYDAJ=withdrawal}, operation
#   {VKLAD=cash credit, PREVOD Z UCTU=collection from another bank,
#    VYBER=cash withdrawal, VYBER KARTOU=card withdrawal,
#    PREVOD NA UCET=remittance to another bank}, amount, balance,
#   k_symbol {SIPO=household, UROK=interest credited, SLUZBY=service payment,
#    DUCHOD=pension, POJISTNE=insurance, UVER=loan payment,
#    SANKC. UROK=sanction interest}, bank, account
# loan (682 rows; date 1993-07-05..1998-12-08): loan_id, account_id, date,
#   amount, duration {12,24,36,48,60}, payments, status
#   {A=finished OK, B=finished default, C=running OK, D=running in debt}
# account (4500): account_id, district_id, frequency
#   {POPLATEK MESICNE=monthly, POPLATEK TYDNE=weekly,
#    POPLATEK PO OBRATU=after transaction}, date
# client (5369): client_id, gender, birth_date, district_id
# disp (5369): disp_id, client_id, account_id, type {OWNER, DISPONENT}
# card (892): card_id, disp_id, type {junior, classic, gold}, issued
# order (6471): order_id, account_id, bank_to, account_to, amount,
#   k_symbol {SIPO, UVER, POJISTNE, LEASING, blank}
# district (77): district_id; A2=name, A3=region, A4=inhabitants,
#   A11=avg salary, A12=unempl 1995, A13=unempl 1996,
#   A15=crimes 1995, A16=crimes 1996

# ---------------------------------------------------------------------------
# Task definitions
# ---------------------------------------------------------------------------

DASHBOARD_TASKS = [
    dict(
        nl_request=(
            "Build a monthly executive overview dashboard for the lending "
            "portfolio in 1996. Include a KPI tile for total approved loan "
            "amount, a time-series chart of monthly approved loan count, a "
            "stacked bar showing loan status mix (finished OK / finished "
            "default / running OK / running in debt) by month, and a bar of "
            "average loan amount by duration bucket."
        ),
        evidence=(
            "Loans are in `loan`; status codes A,B,C,D map to "
            "finished-OK / finished-default / running-OK / running-in-debt. "
            "Duration buckets use the `loan.duration` column (months: 12, 24, "
            "36, 48, 60)."
        ),
        expected_metrics="SUM(loan.amount); COUNT(loan.loan_id); AVG(loan.amount)",
        expected_dimensions="loan.date (month grain); loan.status; loan.duration",
        expected_filters="EXTRACT(YEAR FROM CAST(loan.date AS DATE)) = 1996",
        expected_time_range="1996-01-01 to 1996-12-31, monthly",
        expected_viz_type="kpi; line; stacked_bar; bar",
        difficulty="medium",
        notes=(
            "4 charts on one dashboard. Mostly aggregations on `loan` only; "
            "no joins required. Tests time-grain selection, KPI tile, "
            "categorical stacking, dimension bucketing."
        ),
    ),
    dict(
        nl_request=(
            "Build a regional risk dashboard. For each of the eight Czech "
            "regions, show: number of clients, count of active loans (status "
            "C or D), default rate (B over A+B for finished loans), and "
            "average client salary at the region's branch. Use a regional "
            "choropleth-style table plus a horizontal bar of default rate."
        ),
        evidence=(
            "Region is `district.A3`. Clients live in districts via "
            "`client.district_id`. Loans connect through "
            "client -> disp -> account -> loan. A11 is average salary."
        ),
        expected_metrics=(
            "COUNT(DISTINCT client.client_id); "
            "COUNT(loan.loan_id) WHERE status IN ('C','D'); "
            "default_rate = COUNT(B) / COUNT(A or B); "
            "AVG(district.A11)"
        ),
        expected_dimensions="district.A3",
        expected_filters="status logic per metric",
        expected_time_range="all-time (no temporal filter)",
        expected_viz_type="table; bar",
        difficulty="hard",
        notes=(
            "Multi-join across 4-5 tables. Tests metric-grounding for "
            "default_rate (a derived metric not present as a column), "
            "multi-chart layout, dimension agreement across charts."
        ),
    ),
    dict(
        nl_request=(
            "Create a credit-card product overview dashboard. Show issuance "
            "volume by month (line, by card type), issued-card mix by type "
            "(pie), and the count of card-withdrawal transactions per month "
            "for 1997 (line) so we can see whether issuance leads "
            "transaction volume."
        ),
        evidence=(
            "Card type is `card.type` (junior, classic, gold). Card-"
            "withdrawal transactions are `trans.operation = 'VYBER KARTOU'`. "
            "Issuance date is `card.issued`."
        ),
        expected_metrics=(
            "COUNT(card.card_id); COUNT(trans.trans_id) "
            "WHERE operation='VYBER KARTOU'"
        ),
        expected_dimensions="card.issued (month grain); card.type; trans.date (month grain)",
        expected_filters="trans line filtered to 1997",
        expected_time_range="all card issuance; 1997 for transactions",
        expected_viz_type="line; pie; line",
        difficulty="medium",
        notes=(
            "Two different time-series share an x-axis convention. Tests "
            "the agent's ability to pick the right time grain and align "
            "two related but separate series on a dashboard."
        ),
    ),
    dict(
        nl_request=(
            "Build a transaction-mix dashboard for account holders. Show: "
            "total transaction amount by transaction type (PRIJEM=credit / "
            "VYDAJ=withdrawal) per month for 1997-1998 (stacked bar), "
            "share of transactions by k_symbol purpose code (pie), and "
            "monthly trend of average balance after transaction (line)."
        ),
        evidence=(
            "trans.type encodes credit/withdrawal. trans.k_symbol is the "
            "purpose code; document SIPO=household, SLUZBY=service, "
            "POJISTNE=insurance, UVER=loan-payment. Balance is post-"
            "transaction account balance."
        ),
        expected_metrics=(
            "SUM(trans.amount) by type; COUNT(trans.trans_id) by k_symbol; "
            "AVG(trans.balance)"
        ),
        expected_dimensions="trans.date (month); trans.type; trans.k_symbol",
        expected_filters="EXTRACT(YEAR FROM CAST(trans.date AS DATE)) IN (1997, 1998)",
        expected_time_range="1997-01..1998-12 monthly",
        expected_viz_type="stacked_bar; pie; line",
        difficulty="medium",
        notes=(
            "Tests handling of large fact table (1M rows) for monthly "
            "aggregates, NULL handling on k_symbol, and category encoding."
        ),
    ),
    dict(
        nl_request=(
            "Create a client-demographics dashboard. Show a histogram of "
            "client age (in years; ages computed against 1998-12-31 as the "
            "reference date), a gender breakdown bar, an age-vs-loan-size "
            "scatter for clients who hold loans, and a table of the top 10 "
            "districts by client count."
        ),
        evidence=(
            "Age = year_of('1998-12-31') - year_of(client.birth_date). "
            "Loan size joins through disp -> account -> loan."
        ),
        expected_metrics=(
            "COUNT(client.client_id); loan.amount per loan-holding client"
        ),
        expected_dimensions="age bucket; client.gender; district.A2",
        expected_filters="loan-holding clients only for the scatter",
        expected_time_range="age computed to 1998-12-31",
        expected_viz_type="histogram; bar; scatter; table",
        difficulty="hard",
        notes=(
            "Tests derived-column construction (age), multi-table join for "
            "scatter, and dashboard-level mix of distribution and ranking."
        ),
    ),
    dict(
        nl_request=(
            "Build a quarterly transaction-volume dashboard for each of the "
            "five largest districts (by inhabitants A4). Show one line "
            "chart per district plus a combined bar comparing total "
            "quarterly transaction amount across the five districts in "
            "1997, in a 2x3 grid layout."
        ),
        evidence=(
            "Inhabitants is `district.A4` (TEXT in BIRD; cast to integer). "
            "Transactions join through district -> account -> trans."
        ),
        expected_metrics="SUM(trans.amount); COUNT(trans.trans_id)",
        expected_dimensions=(
            "trans.date (quarter grain); district.A2 for the five "
            "selected districts"
        ),
        expected_filters=(
            "EXTRACT(YEAR FROM CAST(trans.date AS DATE)) = 1997; "
            "top-5 districts by CAST(district.\"A4\" AS INTEGER)"
        ),
        expected_time_range="1997 Q1..Q4",
        expected_viz_type="line; bar",
        difficulty="hard",
        notes=(
            "Layout instruction (2x3 grid). Top-N selection has to happen "
            "at planning time; quarter grain not directly in schema."
        ),
    ),
    dict(
        nl_request=(
            "Build a loan-portfolio aging dashboard for 1998. Slice loans "
            "by status, by duration bucket (12 / 24 / 36 / 48 / 60 months), "
            "and by approval cohort year. Include: stacked bar of loan "
            "count by status x cohort, table of average loan amount by "
            "duration bucket and status, and a KPI for total approved "
            "amount for 1998."
        ),
        evidence=(
            "Approval cohort year = EXTRACT(YEAR FROM CAST(loan.date AS DATE)). "
            "Status A/B/C/D as above. Duration is `loan.duration` (months)."
        ),
        expected_metrics="COUNT(loan); AVG(loan.amount); SUM(loan.amount)",
        expected_dimensions=(
            "loan.status; loan.duration; "
            "EXTRACT(YEAR FROM CAST(loan.date AS DATE))"
        ),
        expected_filters=(
            "for the KPI: EXTRACT(YEAR FROM CAST(loan.date AS DATE)) = 1998"
        ),
        expected_time_range="all-time for charts; 1998 for KPI",
        expected_viz_type="stacked_bar; pivot_table; kpi",
        difficulty="medium",
        notes=(
            "Three different aggregations on the same table; agent must "
            "not duplicate-create the dataset."
        ),
    ),
    dict(
        nl_request=(
            "Build a card-program acquisition dashboard. Show quarterly "
            "issuance trend by card type (gold / classic / junior, 1994-"
            "1998), a funnel chart from card issuance to first card-"
            "withdrawal transaction (counts of clients reaching each "
            "stage), and a KPI tile for the average days from card "
            "issuance to first card transaction."
        ),
        evidence=(
            "First card-withdrawal: MIN(trans.date) per client where "
            "trans.operation='VYBER KARTOU'. Days_to_first uses "
            "(first_trans_date - card.issued)."
        ),
        expected_metrics=(
            "COUNT(card); funnel stage counts; "
            "AVG(CAST(first_trans AS DATE) - CAST(issued AS DATE))"
        ),
        expected_dimensions="card.issued (quarter); card.type",
        expected_filters="card.issued between 1994 and 1998",
        expected_time_range="1994 Q1..1998 Q4",
        expected_viz_type="line; funnel; big_number",
        difficulty="hard",
        notes=(
            "Funnel + cohort thinking. PostgreSQL uses date subtraction; "
            "StarRocks uses DATEDIFF."
        ),
    ),
    dict(
        nl_request=(
            "Create a household-payment risk dashboard. Show monthly total "
            "household-payment outflow (k_symbol='SIPO') for 1997-1998 "
            "(line), accounts whose household payments exceed twice their "
            "1996 monthly average (table of account_id with the ratio), "
            "and a regional bar of total household-payment volume by "
            "region."
        ),
        evidence=(
            "Household = trans.k_symbol='SIPO'. Region from district.A3 "
            "via account.district_id."
        ),
        expected_metrics=(
            "SUM(trans.amount); ratio_to_1996_baseline; "
            "SUM(trans.amount) by region"
        ),
        expected_dimensions="trans.date (month); account_id; district.A3",
        expected_filters="trans.k_symbol='SIPO'",
        expected_time_range="1996 baseline; 1997-1998 trend",
        expected_viz_type="line; table; bar",
        difficulty="hard",
        notes=(
            "Combines dashboard authoring with a baseline-ratio metric "
            "that requires a CTE / subquery over a different time range."
        ),
    ),
    dict(
        nl_request=(
            "Build a 'new-account growth and quality' dashboard for "
            "Branch Manager review. Charts: monthly new-account openings "
            "(line, 1993-1998), share of new accounts by frequency "
            "preference (POPLATEK MESICNE / TYDNE / PO OBRATU), and a "
            "heatmap of new-account count by district x quarter for 1996. "
            "Add a KPI tile for total active accounts as of 1998-12-31."
        ),
        evidence=(
            "New account opening date = account.date. Active = any "
            "transaction or loan record after the cutoff; for the KPI, "
            "use accounts with at least one trans on or before 1998-12-31."
        ),
        expected_metrics=(
            "COUNT(account); COUNT(account) by frequency; "
            "COUNT(DISTINCT account_id) over trans"
        ),
        expected_dimensions="account.date (month and quarter); frequency; district",
        expected_filters=(
            "for heatmap: EXTRACT(YEAR FROM CAST(account.date AS DATE)) = 1996"
        ),
        expected_time_range="1993-1998 / 1996 for heatmap",
        expected_viz_type="line; pie; heatmap; big_number",
        difficulty="hard",
        notes=(
            "Heatmap is a layout the chart-param references must support. "
            "Tests dashboard composition with mixed time grains."
        ),
    ),
]

ANALYSIS_TASKS = [
    dict(
        nl_request=(
            "Analyse the year-over-year change in total transaction amount "
            "from 1996 to 1997. Was the change driven mostly by transaction-"
            "count increase or by average-amount-per-transaction increase? "
            "Quantify each contribution."
        ),
        evidence=(
            "trans.date covers 1993-1998. Decompose total = count * "
            "average. Compare 1996 totals against 1997 totals."
        ),
        expected_metrics="SUM(amount), COUNT(*), AVG(amount) per year",
        expected_dimensions="trans.date (year)",
        expected_filters="EXTRACT(YEAR FROM CAST(trans.date AS DATE)) IN (1996, 1997)",
        expected_time_range="1996 vs 1997 yearly",
        expected_viz_type="big_number_total; bar (decomposition)",
        difficulty="medium",
        notes=(
            "Tests period-over-period reasoning + multiplicative "
            "decomposition. Rubric scores: directionally-correct YoY, "
            "correct decomposition, evidence support."
        ),
    ),
    dict(
        nl_request=(
            "Find the months in 1997 where total card-withdrawal "
            "(VYBER KARTOU) volume was at least 30% above the 1997 "
            "monthly average, and characterise what is unusual about those "
            "months (which districts contributed most, what card types)."
        ),
        evidence=(
            "Filter trans to operation='VYBER KARTOU' and "
            "EXTRACT(YEAR FROM CAST(trans.date AS DATE)) = 1997. "
            "Compute monthly total and the 1997 monthly average; flag "
            "months >=1.30x. For flagged months, attribute by district "
            "(via account.district_id) and card type (via card.type "
            "joined through disp)."
        ),
        expected_metrics="SUM(amount); ratio to 1997 monthly mean",
        expected_dimensions="month; district.A2; card.type",
        expected_filters=(
            "operation='VYBER KARTOU'; "
            "EXTRACT(YEAR FROM CAST(trans.date AS DATE)) = 1997"
        ),
        expected_time_range="1997 monthly",
        expected_viz_type="line + annotation; bar by district and card type",
        difficulty="hard",
        notes=(
            "Anomaly identification + attribution. Rubric scores: "
            "correct flagged month set, top contributing district, "
            "evidence support."
        ),
    ),
    dict(
        nl_request=(
            "Compare the five Czech regions on lending-portfolio quality "
            "in 1997: which region has the highest default rate (status='B' "
            "share among finished loans) and what client demographic "
            "differences (gender mix, average salary A11) might correlate?"
        ),
        evidence=(
            "Region from district.A3. Default rate = count(status='B') / "
            "count(status IN ('A','B')) for finished loans. Salary is A11. "
            "Gender from client. Loans connect via client -> disp -> "
            "account -> loan."
        ),
        expected_metrics="default rate; gender mix; AVG(A11)",
        expected_dimensions="district.A3",
        expected_filters="loan.status IN ('A','B')",
        expected_time_range="loans approved by 1997-12-31",
        expected_viz_type="bar; bar; scatter",
        difficulty="hard",
        notes=(
            "Tests cross-table joins, derived metric, and correlational "
            "reasoning (without overclaiming causality)."
        ),
    ),
    dict(
        nl_request=(
            "Examine seasonality in transaction volume. Across all years "
            "1994-1998, which calendar month consistently has the highest "
            "transaction count and which the lowest? Quantify the gap and "
            "comment on whether the seasonal pattern is stable."
        ),
        evidence=(
            "Aggregate trans count by month-of-year averaged across "
            "1994-1998. Stability = year-over-year coefficient-of-"
            "variation per month."
        ),
        expected_metrics="COUNT(trans); CV across years per calendar month",
        expected_dimensions="month-of-year (1..12); year",
        expected_filters="EXTRACT(YEAR FROM CAST(trans.date AS DATE)) BETWEEN 1994 AND 1998",
        expected_time_range="1994-1998",
        expected_viz_type="line (one per year overlay)",
        difficulty="medium",
        notes=(
            "Tests seasonality reasoning (across-year aggregation) with "
            "stability check."
        ),
    ),
    dict(
        nl_request=(
            "Among loans approved in 1996, which 12-month duration band "
            "(short=12, medium=24-36, long=48-60) has the worst default "
            "performance (highest B share among finished)? Quantify and "
            "characterise the typical loan in the worst band."
        ),
        evidence=(
            "loan.duration buckets: short=12, medium IN (24,36), "
            "long IN (48,60). Default among finished = B / (A + B) within "
            "the bucket."
        ),
        expected_metrics="default rate; AVG(amount); AVG(payments)",
        expected_dimensions="duration bucket",
        expected_filters=(
            "EXTRACT(YEAR FROM CAST(loan.date AS DATE)) = 1996; "
            "status IN ('A','B')"
        ),
        expected_time_range="1996 cohort",
        expected_viz_type="bar; table",
        difficulty="medium",
        notes=(
            "Tests bucketing logic and rate computation with a finite "
            "denominator."
        ),
    ),
    dict(
        nl_request=(
            "What happened to the proportion of card-withdrawal "
            "transactions among all withdrawals between 1996 and 1998? "
            "Is the trend consistent across regions? Identify regions "
            "that are clear outliers from the national trend."
        ),
        evidence=(
            "Withdrawals = trans.type='VYDAJ'. Card-withdrawals = "
            "operation='VYBER KARTOU'. Proportion = card-with / all-with. "
            "Group by year and region (district.A3)."
        ),
        expected_metrics="proportion; deviation from national",
        expected_dimensions="year; district.A3",
        expected_filters=(
            "trans.type='VYDAJ'; "
            "EXTRACT(YEAR FROM CAST(trans.date AS DATE)) IN (1996, 1997, 1998)"
        ),
        expected_time_range="1996-1998 yearly",
        expected_viz_type="line (one per region); bar of deviation",
        difficulty="hard",
        notes=(
            "Trend + outlier identification across multiple groups."
        ),
    ),
    dict(
        nl_request=(
            "Are clients who request weekly statement issuance "
            "(POPLATEK TYDNE) different from monthly-issuance clients in "
            "loan-default rate? If so, by how much, and is the difference "
            "statistically meaningful given the sample sizes?"
        ),
        evidence=(
            "Frequency on account.frequency. Statement of POPLATEK TYDNE "
            "vs POPLATEK MESICNE. Default rate = B/(A+B) on finished "
            "loans, restricted to accounts with each frequency."
        ),
        expected_metrics="default rate; sample size; difference",
        expected_dimensions="account.frequency",
        expected_filters="status IN ('A','B'); finished loans only",
        expected_time_range="all-time",
        expected_viz_type="bar; table",
        difficulty="medium",
        notes=(
            "Tests segment comparison with explicit sample-size honesty. "
            "Rubric should reward acknowledging uncertainty when n is "
            "small."
        ),
    ),
    dict(
        nl_request=(
            "For accounts in 'south Bohemia' region, summarise the "
            "evolution of average account balance (post-transaction) "
            "month-over-month in 1997, and call out any month where the "
            "regional average dropped by more than 5% compared to the "
            "previous month."
        ),
        evidence=(
            "trans.balance is the post-transaction balance. Region via "
            "district.A3='south Bohemia'. MoM change of monthly average "
            "balance per region."
        ),
        expected_metrics="AVG(trans.balance) by month; MoM percent change",
        expected_dimensions="month",
        expected_filters=(
            "district.\"A3\"='south Bohemia'; "
            "EXTRACT(YEAR FROM CAST(trans.date AS DATE)) = 1997"
        ),
        expected_time_range="1997-01..1997-12 monthly",
        expected_viz_type="line + annotation",
        difficulty="medium",
        notes=(
            "Tests region-scoped MoM analysis and threshold-based event "
            "callouts."
        ),
    ),
    dict(
        nl_request=(
            "Compare transaction volume between gold-card-holding clients "
            "and classic-card-holding clients during 1998. Is the per-"
            "client transaction count and average transaction size "
            "materially different between the two groups? Comment on "
            "whether the data supports treating gold cards as a high-"
            "engagement segment."
        ),
        evidence=(
            "Card type from card.type. Per-client metrics aggregate over "
            "transactions joined through disp."
        ),
        expected_metrics="per-client COUNT(trans); per-client AVG(amount)",
        expected_dimensions="card.type IN ('gold','classic')",
        expected_filters=(
            "EXTRACT(YEAR FROM CAST(trans.date AS DATE)) = 1998; "
            "card.type IN ('gold','classic')"
        ),
        expected_time_range="1998",
        expected_viz_type="box_plot; bar",
        difficulty="hard",
        notes=(
            "Tests segment definition (excludes junior), per-client "
            "aggregation, and honest framing."
        ),
    ),
    dict(
        nl_request=(
            "Which districts saw the biggest jump in number of new "
            "accounts opened from 1995 to 1996? Take the top three and "
            "describe what they have in common (region, average salary "
            "A11, unemployment rate change A12 -> A13)."
        ),
        evidence=(
            "New-account count per district per year via account.date. "
            "Compare 1995 vs 1996. District attributes from district "
            "table."
        ),
        expected_metrics="account-count delta; A11; A12->A13 delta",
        expected_dimensions="district.A2 (top 3)",
        expected_filters="EXTRACT(YEAR FROM CAST(account.date AS DATE)) IN (1995, 1996)",
        expected_time_range="1995 vs 1996",
        expected_viz_type="bar; table",
        difficulty="medium",
        notes=(
            "Top-N + characterise. Tests pivoting from temporal delta "
            "into static district attributes."
        ),
    ),
]

RCA_TASKS = [
    dict(
        nl_request=(
            "Total transaction amount in March 1996 was unusually low "
            "compared to neighbouring months. Identify the primary "
            "contributors to this drop. Drill down by region, "
            "transaction type, and k_symbol category."
        ),
        evidence=(
            "Compare March 1996 against Feb 1996 and Apr 1996 baselines. "
            "Drill dimensions: district.A3 (region), trans.type, "
            "trans.k_symbol."
        ),
        expected_metrics="SUM(trans.amount); contribution to month-vs-baseline gap",
        expected_dimensions="district.A3; trans.type; trans.k_symbol",
        expected_filters="trans in Feb/Mar/Apr 1996",
        expected_time_range="1996-02..1996-04",
        expected_viz_type="waterfall; bar",
        difficulty="hard",
        notes=(
            "Per the date distribution in BIRD financial, Feb 1996 has "
            "12,507 rows; Mar 1996 has 13,297; Apr 1996 has 13,754. "
            "The agent should detect that Mar 1996 is NOT a strong "
            "outlier in row count -- if amount-total drops without count "
            "drop, then average per transaction has fallen."
        ),
    ),
    dict(
        nl_request=(
            "The default rate on loans approved in Q3 1996 is materially "
            "higher than in Q2 1996. Find the primary driver: is it "
            "duration mix, amount distribution, geographic concentration, "
            "or client gender mix?"
        ),
        evidence=(
            "Filter loan.date to 1996-04..06 vs 1996-07..09. Default = "
            "status='B' over status IN ('A','B'). Drill on loan.duration, "
            "loan.amount bucket, district.A3, client.gender."
        ),
        expected_metrics="default rate; volume by drill axis",
        expected_dimensions="duration; amount bucket; region; gender",
        expected_filters="loan.date in 1996 Q2 vs Q3; status IN ('A','B')",
        expected_time_range="1996 Q2 vs Q3",
        expected_viz_type="bar (each axis); table",
        difficulty="hard",
        notes=(
            "Tests multi-axis drill and a discipline of stopping when one "
            "axis explains the gap. Rubric: identify primary driver, "
            "correct ranking of contributors, evidence-supported."
        ),
    ),
    dict(
        nl_request=(
            "Card-withdrawal transaction count for January 1998 was "
            "exceptionally high (1,702) versus the 1997 monthly average "
            "(180.5). "
            "Was this driven by new card issuance during late 1997, by a "
            "specific card type, or by a specific subset of districts?"
        ),
        evidence=(
            "For operation='VYBER KARTOU', January 1998 count is 1,702 "
            "and the 1997 monthly average is 180.5. The 42,940 count is "
            "all January 1998 transactions, not card-withdrawal "
            "transactions. Drill dimensions: card.type via disp; "
            "account.district_id; new-issuance cohort = card.issued in "
            "1997-Q4."
        ),
        expected_metrics="COUNT(trans) by drill axis; share of total",
        expected_dimensions="card.type; district.A2; card.issued cohort",
        expected_filters=(
            "trans.operation='VYBER KARTOU'; "
            "CAST(trans.date AS DATE) >= DATE '1997-01-01' AND "
            "CAST(trans.date AS DATE) < DATE '1998-02-01'"
        ),
        expected_time_range="1997 monthly + 1998-01",
        expected_viz_type="bar; line + annotation",
        difficulty="hard",
        notes=(
            "Corrected 2026-06-11 after SQL Lab validation found the "
            "old ~43k value was all transactions, not VYBER KARTOU. "
            "Tests cohort thinking and multi-attribute attribution."
        ),
    ),
    dict(
        nl_request=(
            "In 1996, district 5 (Kolin) had a noticeably lower average "
            "post-transaction balance than its 1995 average. Identify the "
            "main contributor. Drill by account-frequency, by client age "
            "band, and by transaction k_symbol."
        ),
        evidence=(
            "trans.balance is post-transaction. Kolin = district_id=5. "
            "Compare 1995 vs 1996 average balance per account. Age band "
            "from client.birth_date. Drill axes as listed."
        ),
        expected_metrics="AVG(trans.balance); MoM/YoY delta",
        expected_dimensions="account.frequency; age band; trans.k_symbol",
        expected_filters="account.district_id=5",
        expected_time_range="1995 vs 1996",
        expected_viz_type="bar; line",
        difficulty="hard",
        notes=(
            "Tests cross-table joins (district-account-trans-disp-client) "
            "with a derived age-band column."
        ),
    ),
    dict(
        nl_request=(
            "In 1997, accounts with weekly statement issuance "
            "(POPLATEK TYDNE) defaulted on loans at a noticeably higher "
            "rate than other frequencies. Why? Investigate: are these "
            "accounts concentrated in lower-salary districts, do they "
            "skew toward larger loan amounts, or toward longer durations?"
        ),
        evidence=(
            "Compute default rate by frequency, restricted to loans with "
            "loan.date in 1997. Drill on district.A11 quartile, "
            "loan.amount quartile, loan.duration bucket."
        ),
        expected_metrics="default rate; mean amount; mean duration; A11 distribution",
        expected_dimensions="frequency; salary quartile; amount quartile; duration",
        expected_filters=(
            "EXTRACT(YEAR FROM CAST(loan.date AS DATE)) = 1997; "
            "status IN ('A','B')"
        ),
        expected_time_range="1997 cohort",
        expected_viz_type="bar; box_plot",
        difficulty="hard",
        notes=(
            "Tests segment-cause separation: do you accept correlation "
            "or do you produce a counterfactual decomposition? Rubric "
            "should reward acknowledging confounders."
        ),
    ),
    dict(
        nl_request=(
            "Across all districts in 1996, the share of household "
            "payments (k_symbol='SIPO') in total transaction count varies "
            "substantially. Identify the district with the most extreme "
            "deviation from the national average and explain what makes "
            "it different (region, salary level, unemployment rate)."
        ),
        evidence=(
            "SIPO share = count(SIPO) / count(*) per district per year. "
            "Compare each district's 1996 share to the 1996 national "
            "share. Pick max-deviation district; describe its A3, A11, "
            "A12, A13 profile."
        ),
        expected_metrics="SIPO share; deviation from national",
        expected_dimensions="district.A2",
        expected_filters="EXTRACT(YEAR FROM CAST(trans.date AS DATE)) = 1996",
        expected_time_range="1996",
        expected_viz_type="bar (sorted); table (district profile)",
        difficulty="medium",
        notes=(
            "Tests outlier identification + characterisation."
        ),
    ),
    dict(
        nl_request=(
            "Why did the count of new accounts opened drop substantially "
            "in February 1994 vs January 1994? Investigate by district, "
            "by frequency choice, and by region. Distinguish a one-time "
            "January spike from a February dip."
        ),
        evidence=(
            "Per the trans schema's monthly distribution, January 1994 "
            "has 9,139 trans rows and February 1994 has 5,601. The "
            "account-opening pattern likely correlates. Use account.date."
        ),
        expected_metrics="COUNT(account); ratio Feb/Jan",
        expected_dimensions="district.A2; frequency; district.A3",
        expected_filters=(
            "CAST(account.date AS DATE) >= DATE '1994-01-01' AND "
            "CAST(account.date AS DATE) < DATE '1994-03-01'"
        ),
        expected_time_range="1994-01..1994-02",
        expected_viz_type="bar; line; table",
        difficulty="medium",
        notes=(
            "Tests baseline framing. The rubric should reward not "
            "overclaiming causality where data is descriptive only."
        ),
    ),
    dict(
        nl_request=(
            "Within finished loans (status A or B), gold-card holders "
            "have a different default rate from junior-card holders. "
            "Quantify the gap and decompose: how much is explained by "
            "client age, how much by loan amount, and how much remains "
            "unexplained?"
        ),
        evidence=(
            "Card type via disp. Default = B/(A+B). Decomposition: "
            "compare like-for-like client-age bands and like-for-like "
            "loan-amount bands; what remains is unexplained."
        ),
        expected_metrics="default rate; explained-share by attribute",
        expected_dimensions="card.type; age band; amount band",
        expected_filters="status IN ('A','B'); card.type IN ('gold','junior')",
        expected_time_range="all-time finished loans",
        expected_viz_type="bar; stacked bar (decomposition)",
        difficulty="hard",
        notes=(
            "Tests structured attribution. Rubric: rank-correct "
            "contributors and an honest 'unexplained' residual."
        ),
    ),
    dict(
        nl_request=(
            "In 1997, total monthly loan-payment outflows (k_symbol='UVER') "
            "grew faster in 'east Bohemia' than in any other region. "
            "Identify the underlying driver: is it more new loans being "
            "approved in that region, larger average loans, or higher-"
            "frequency repayment?"
        ),
        evidence=(
            "k_symbol='UVER' on trans is loan-payment outflow. Region via "
            "account.district_id -> district.A3. Drill: count of new "
            "loans per region in 1996-1997, AVG(loan.amount) per region, "
            "trans count per loan-holding account per region."
        ),
        expected_metrics="trans SUM(amount); count of loans; avg amount",
        expected_dimensions="district.A3; year",
        expected_filters=(
            "trans.k_symbol='UVER'; "
            "EXTRACT(YEAR FROM CAST(trans.date AS DATE)) IN (1996, 1997)"
        ),
        expected_time_range="1996 vs 1997 yearly per region",
        expected_viz_type="line; bar",
        difficulty="hard",
        notes=(
            "Tests ratio decomposition (volume = N * avg) at regional "
            "scope."
        ),
    ),
    dict(
        nl_request=(
            "The number of loan applications with status='D' "
            "(running, in debt) is concentrated in a small number of "
            "districts. Identify the top 3 districts by status-D count "
            "and investigate whether they share district-level features "
            "(unemployment rate A13, crime rate A16, average salary A11) "
            "that distinguish them from low-D districts."
        ),
        evidence=(
            "loan.status='D' count per district. Top 3 vs bottom 3 by "
            "status-D count; compare district attributes."
        ),
        expected_metrics="COUNT(loan WHERE status='D'); A11; A13; A16",
        expected_dimensions="district.A2 (top 3 vs bottom 3)",
        expected_filters="loan.status='D'",
        expected_time_range="all-time",
        expected_viz_type="bar; table; scatter",
        difficulty="medium",
        notes=(
            "Tests outlier-vs-control comparison. Avoids overclaiming "
            "causality; rubric rewards 'these features correlate' "
            "framing."
        ),
    ),
]


def task_id(class_name: str, idx: int) -> str:
    short = {"dashboard": "dashboard", "analysis": "analysis", "rca": "rca"}[class_name]
    return f"self_financial_{short}_{idx:02d}"


def make_rows(class_name: str, tasks: list) -> list:
    rows = []
    artifact_map = {
        "dashboard": "dashboard",
        "analysis": "analysis_report",
        "rca": "rca_report",
    }
    automatic_check_map = {
        "dashboard": "rubric_dashboard",
        "analysis": "rubric_analysis",
        "rca": "rubric_rca",
    }
    for i, t in enumerate(tasks, start=1):
        rows.append({
            "id": task_id(class_name, i),
            "layer": "3",
            "class": class_name,
            "nl_request": t["nl_request"],
            "evidence": t.get("evidence", ""),
            "dataset": "financial",
            "expected_dataset_id": "",
            "expected_metrics": t.get("expected_metrics", ""),
            "expected_dimensions": t.get("expected_dimensions", ""),
            "expected_filters": t.get("expected_filters", ""),
            "expected_time_range": t.get("expected_time_range", ""),
            "expected_artifact_type": artifact_map[class_name],
            "expected_viz_type": t.get("expected_viz_type", ""),
            "ground_truth_sql_sqlite": "",
            "ground_truth_sql_starrocks": "",
            "ground_truth_sql_postgres": "",
            "ground_truth_vegalite": "",
            "automatic_check": automatic_check_map[class_name],
            "difficulty": t.get("difficulty", "medium"),
            "notes": t.get("notes", ""),
        })
    return rows


def main():
    new_rows = (
        make_rows("dashboard", DASHBOARD_TASKS)
        + make_rows("analysis", ANALYSIS_TASKS)
        + make_rows("rca", RCA_TASKS)
    )
    assert len(new_rows) == 30, f"expected 30 layer-3 rows, got {len(new_rows)}"

    # Read existing CSV
    with open(CSV_PATH, newline="") as f:
        reader = csv.DictReader(f)
        existing = list(reader)

    # Drop any prior self_* rows so the script is idempotent.
    kept = [r for r in existing if not r["id"].startswith("self_")]

    # Sanity: header must match.
    if reader.fieldnames != HEADERS:
        # Allow Codex's existing header to drive; if there's a mismatch we'd
        # rather fail loudly than silently lose a column.
        raise SystemExit(
            f"CSV header mismatch.\n"
            f"  expected: {HEADERS}\n"
            f"  actual:   {reader.fieldnames}"
        )

    out_rows = kept + new_rows

    with open(CSV_PATH, "w", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=HEADERS,
            quoting=csv.QUOTE_MINIMAL,
            lineterminator="\n",
        )
        writer.writeheader()
        writer.writerows(out_rows)

    print(f"Wrote {len(out_rows)} rows total ({len(kept)} kept, "
          f"{len(new_rows)} new layer-3) to {CSV_PATH}")


if __name__ == "__main__":
    main()
