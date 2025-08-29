Middleware Workflow for VROOM with Route Matrix Replacement and Google Maps API Correction
Overview

This document explains the workflow of a Node.js middleware service that:

Exposes an endpoint that VROOM will use for OSRM requests.

Builds and caches a distance matrix by correlating GPS coordinates with location IDs from the original VROOM request.

Iteratively refines travel times using the Google Maps API.

Ensures consistency and transparency for debugging while maintaining standard VROOM responses.

Workflow Steps
1. Middleware Setup

Create a Node.js/Express server that exposes a REST endpoint (e.g., /osrm/table).

Configure VROOM to use this middleware endpoint instead of the real OSRM backend.

Maintain logging to trace every intercepted OSRM call.

2. OSRM-Compatible Proxy Endpoint (used by VROOM)

Expose an HTTP endpoint (e.g., /osrm/*) that mimics OSRM’s API shape (e.g., /table, /route). Configure VROOM to use this endpoint as its routing backend.

VROOM will send requests as GPS coordinates.

The proxy logs every request/response and, by default, does not call real OSRM (unless in fallback mode).

3. Matrix-Backed OSRM Emulation (using the original request)

Use the original VROOM request, which includes a distance/duration matrix and a correlation between location IDs and GPS coordinates.

Build an in-memory array that maps GPS coordinates → location IDs (with tolerance for rounding/precision).

On each incoming OSRM-style request from VROOM:

Parse the coordinate pairs from the request.

Convert each coordinate to its corresponding location_id using the correlation array.

For each (from_id, to_id) pair, look up the value in the provided matrix.

Compile an OSRM-compliant response (durations/distances arrays, etc.) and return it to VROOM as if it were OSRM.

No VROOM changes required. Optional fallback: if a coordinate cannot be mapped or a matrix cell is missing, call real OSRM, record the value, and update the cache.

4. Google Maps API Correction Loop

After VROOM produces a solution using the matrix, iterate through each leg:

Send requests to Google Directions API (with traffic_model=best_guess).

Compare matrix durations with Google’s traffic-aware durations.

Identify discrepancies above a configurable threshold.

Replace suspect durations in the matrix with Google’s values.

Rerun VROOM with the corrected matrix.

Repeat until all discrepancies fall below threshold.

5. Return Final Solution

Once iterations stabilize, return the final solution in standard VROOM response format.

VROOM remains unmodified and unaware of the middleware’s work.

Potential Pitfalls & Workarounds
A. Loss of Transparency with Precomputed Matrices

Problem: VROOM logs are less informative when OSRM is bypassed. Solution: Middleware should emulate OSRM responses and maintain logs of every substituted matrix call.

B. Inconsistent Google API Responses

Problem: Google may return varying durations for the same query due to real-time traffic. Solution:

Average multiple queries over a short window.

Cache recent results to avoid API overuse.

C. API Quota & Cost Issues

Problem: Google APIs charge per request and have quota limits. Solution:

Batch requests whenever possible (e.g., Distance Matrix API for multiple pairs).

Use OSRM/matrix lookup for initial fill, Google only for correction.

D. Concurrency & Matrix Access Model

Reality: During OSRM emulation, the matrix is read-only. No writes occur to the baseline matrix. Writes happen only in the Google correction loop, and those writes target a new matrix version (e.g., matrix_v2). Workaround:

Treat the baseline matrix as immutable; share it safely across threads/processes.

Build corrections into a separate matrix (matrix_vNext) and perform an atomic pointer swap once a full correction pass completes.

Keep a simple version tag in memory (e.g., active_matrix_version) to ensure all in-flight OSRM emulation requests read from the same immutable snapshot.

E. Null or Missing Matrix Entries

Problem: Failed API calls leave gaps in the matrix. Solution:

Retry with exponential backoff.

Fallback to OSRM if Google fails. Null or Missing Matrix Entries Problem: Failed API calls leave gaps in the matrix. Solution:

Retry with exponential backoff.

Fallback to OSRM if Google fails.

Step-by-Step Instructions

Set up Middleware

Node.js + Express server.

Expose /osrm/table endpoint.

Point VROOM’s --router option to this endpoint.

Log request/response pairs.

Matrix Initialization & Lookup Array

Parse the original VROOM request.

Build a correlation array between GPS coordinates and location IDs.

Store the matrix from the request for lookups.

Matrix Substitution

On OSRM requests from VROOM:

Match GPS coordinates to IDs.

Retrieve corresponding duration from the request’s matrix.

Compile results into an OSRM-style response.

Google API Correction

Extract route legs from VROOM’s output.

Query Google Directions API for each leg.

Replace durations in the matrix if discrepancy > threshold.

Rerun VROOM with corrected values.

Iteration Loop

Continue correction until all legs are within tolerance.

Store corrected matrix for future reuse.

Final Delivery

Return corrected solution in VROOM format.

Maintain transparent logs for debugging.

Summary

This middleware provides:

A fake OSRM endpoint that VROOM queries.

Transparent interception of GPS-based OSRM requests.

A persistent, reusable route matrix tied to location IDs.

Iterative correction with Google Maps traffic data.

Standardized VROOM responses without modifying VROOM itself.

By combining OSRM emulation with Google’s traffic-aware accuracy, the system balances performance, cost, and reliability.