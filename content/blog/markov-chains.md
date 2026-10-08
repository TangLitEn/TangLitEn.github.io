---
title: "Markov chains: reading the paths between states"
date: "2026-10-07"
tags: ["Mathematics", "Tools"]
logo: "/post-logos/markov-chains.svg"
description: "What a Markov chain reveals about a workflow—and a browser tool that turns pasted time and transition tables into a weighted graph."
draft: false
---

A time-spent dashboard tells us where attention accumulates. A transition graph asks a different question: **where do people go next?** Together, they can reveal the shape of a workflow: the routes people repeat, the places they return to, and the steps that deserve a closer look.

This post introduces Markov chains, explains what their probabilities mean, and works through a product-usage example.

## What is a Markov chain?

A **Markov chain** is a model of a system that moves between states according to probabilities. In a first-order chain, the probability of the next state depends on the current state alone, once that state is known. This is the **Markov property**:

> P(Xₜ₊₁ = j | Xₜ = i, Xₜ₋₁, …, X₀) = P(Xₜ₊₁ = j | Xₜ = i)

Xₜ is the state at step t. “Memoryless” describes the model's conditional dependence; it does not mean that people forget their earlier actions. A state can also encode relevant history. [Stanford's introduction explains the Markov property](https://nlp.stanford.edu/IR-book/html/htmledition/markov-chains-1.html).

For an online course, states could be **Course catalog**, **Lesson / reading**, and **Quiz / practice**. A step might mean the next recorded navigation event. It need not mean one second or one minute. Define that unit before interpreting the graph.

In a **time-homogeneous** chain, the probabilities stay fixed across steps. A navigation model estimated for one week assumes that week's transition pattern is stable enough for the question being asked. A redesign or a different user cohort can change it.

## From counts to probabilities

Suppose a deliberately small, complete example has the following next-state counts. These numbers are entirely fictional, as are all example datasets in this post.

| From | To | Count | P(next) |
| --- | --- | ---: | ---: |
| Browse | Study | 60 | 0.60 |
| Browse | Practice | 40 | 0.40 |
| Study | Browse | 25 | 0.25 |
| Study | Practice | 75 | 0.75 |
| Practice | Browse | 20 | 0.20 |
| Practice | Study | 30 | 0.30 |
| Practice | Practice | 50 | 0.50 |

For each source state i, estimate the next-state probability by dividing a transition's count by **all outgoing transition counts from that source**:

> Pᵢⱼ = Cᵢⱼ / Σₖ Cᵢₖ

Browse → Study is 60 / (60 + 40) = 0.60. It is not 60 divided by all transitions in the dataset. Study → Browse is a separate conditional probability: 0.25. The arrows can therefore have very different weights in opposite directions.

In the order Browse, Study, Practice, the corresponding **transition matrix** is:

| Current state ↓ / Next state → | Browse | Study | Practice |
| --- | ---: | ---: | ---: |
| Browse | 0.00 | 0.60 | 0.40 |
| Study | 0.25 | 0.00 | 0.75 |
| Practice | 0.20 | 0.30 | 0.50 |

Each row sums to one. A graph displays the same matrix as states and directed arrows. A missing arrow denotes probability zero only when the model's transition data are complete. [MIT's lecture on finite-state chains](https://ocw.mit.edu/courses/6-262-discrete-stochastic-processes-spring-2011/resources/lecture-7-finite-state-markov-chains-the-matrix-approach/) develops this matrix approach.

Counts estimate probabilities; they are not probabilities themselves. A raw weighted directed graph becomes a Markov transition model when its nonnegative outgoing weights are normalized and the transition interpretation is defined.

## What can it tell us?

### Likely next steps and repeated routes

In the illustrative table, a Study event is followed by Practice with probability 0.75. That tells us which next step is common under this model. A two-way loop can suggest a useful review cycle, confusion, or an unfinished task. The arrows identify a pattern to investigate; the product context supplies its meaning.

To look two transitions ahead, multiply the matrix by itself: **P²**. For example, the probability of being in Practice exactly two steps after Browse is:

> (0.60 × 0.75) + (0.40 × 0.50) = 0.65

The two terms describe Browse → Study → Practice and Browse → Practice → Practice. More generally, Pⁿ gives probabilities after n steps. This differs from the probability of visiting Practice *at any time* within n steps. [Berkeley's notes explain multi-step transitions](https://stat210a.berkeley.edu/fall-2025/reader/bayes-computation.html#markov-chains).

### Long-run patterns

A **stationary distribution** π satisfies πP = π: one more transition leaves the distribution unchanged. For the illustrative matrix, π is approximately (0.178, 0.272, 0.550). These numbers are calculated from this example's matrix.

A finite chain in which every state can reach every other has a unique stationary distribution. If it is also aperiodic, its step-by-step distribution converges to that distribution from any initial state. Disconnected classes or fixed cycles need different interpretations. [Aldous and Fill explain stationarity and these conditions](https://www.stat.berkeley.edu/~aldous/RWG/Book_Ralph/Ch2.S1.html).

For an event-based workflow chain, stationary weights describe long-run shares of **event steps**, not shares of clock time. A screen visited briefly and frequently can have a high event share while accounting for little time. The builder below shows observed total time separately; it does not calculate a stationary distribution.

### Reaching an outcome

If “Completed” is an absorbing state, it stays there: P(Completed → Completed) = 1. An absorbing-chain model can answer questions about eventual completion and expected steps to completion, provided its paths and termination rules are fully specified. These are different questions from the most likely next click. [Berkeley's probability notes cover absorbing chains](https://www.stat.berkeley.edu/users/aldous/134/gravner.pdf).

For a product funnel, include exits as well as completions. Dropping session endings can make continued navigation look more likely than it is. A state that simply lacks outgoing observations is not automatically an absorbing state.

## Where Markov chains are used

| Use case | States and transitions | Useful question |
| --- | --- | --- |
| Product navigation | Screens or actions; next recorded event | Which paths and return loops are common? |
| Service operations | Queue length or operating condition; arrivals, departures, failures | How does the system move between workload levels? |
| Reliability | Working, degraded, failed, repaired; condition changes | How likely is the system to reach a failure state? |
| Simple weather models | Weather categories; next day's category | How does a current condition affect the next day's distribution? |
| Web ranking | Pages; following links or teleporting | Which pages receive more visits in a modeled random walk? |
| Statistical computation | Candidate parameter values; sampling moves | How can we sample from a difficult target distribution? |

The operational and weather rows are examples of how one could define a model; whether the Markov assumption fits must be checked against data. Two established applications are PageRank's random surfer with teleportation, described in [Stanford's information retrieval textbook](https://nlp.stanford.edu/IR-book/html/htmledition/pagerank-1.html), and Markov chain Monte Carlo, which designs transitions to sample a target distribution, explained in [Berkeley's MCMC notes](https://stat210a.berkeley.edu/fall-2025/reader/bayes-computation.html).

## A workflow case: a fictional online course

The builder's example follows learners between a course catalog, lessons, quizzes, a progress dashboard, a help center, and a session-ending state. **All names, times, user totals, and transition counts are invented for demonstration.** They do not represent an actual product or study.

The synthetic time table assigns **480 minutes to Lesson / reading**, **240 minutes to Catalog**, and **180 minutes to Quiz / practice**. Its transition table assigns **Course catalog → Lesson / reading: 60 transitions, P(next) = 0.60**.

Combining the tables suggests useful research questions:

- **Catalog → Lesson is a common next step in this example.** Does opening a lesson lead to learning and completion? Navigation alone does not tell us.
- **Lessons accumulate the most time.** That could reflect focused reading, difficult material, or idle tabs. Time alone cannot distinguish them.
- **Lessons and quizzes connect in both directions.** That might indicate productive revision or uncertainty about the material. Observe sessions before calling the loop friction.
- **Quiz → Help has P(next) = 0.10.** In an actual study, we might investigate which questions prompt help-seeking and whether help resolves the difficulty.

Every state's outgoing probabilities in this sample sum to one. **Session ended** has a self-loop with probability one: this is a modeling convention that makes it absorbing, not a claim that an application records endless session-ending clicks. Its illustrative count is included so both probability modes produce the same graph.

The sample also demonstrates name matching: Catalog matches Course catalog, while Offline notes remains unmatched because it has no transition state. Session ended has no workflow-time row, so its time stays unknown.

If a real table omits destinations, normalization from the remaining counts changes the model. In a separate fictional example, suppose A has outgoing counts of 60 to B and 30 to C, with another destination omitted. Renormalizing the visible rows gives P(A → B) = **60 / 90 ≈ 0.667**. That describes the pasted subset and does not recover the missing original transitions.

## Significance, assumptions, and honest interpretation

A thick arrow means a large supplied next-state probability. It does **not** establish statistical significance, a causal effect, or a good user experience.

Keep the denominator and observation process in view. A probability based on ten transitions is less well supported than one based on thousands, and repeated transitions from the same person are dependent observations. A confidence analysis should account for clustering by user or session rather than treating every click as an independent participant.

Before comparing graphs, keep the event definitions, cohort, session boundaries, and observation period consistent. Remove duplicate tracking events, decide how idle time is treated, and distinguish “no recorded transition” from “cannot transition.” If behavior depends strongly on where someone came from, compare a model that includes the previous state, or separate new and returning users.

Total minutes cannot by themselves estimate average dwell time per visit. The time table's user count also does not supply a visit count, and “Per active user” may use a different denominator. The tool therefore uses Total for node size and keeps Users as supplied metadata; it does not infer dwell times or combine unique user counts across multiple mapped workflows.

::: simulation markov-chain
:::
