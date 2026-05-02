# Video Transcription

## Part 1: Introduction (about 30 seconds) - Current Total 30s

Hello everyone.  
My name is [Name], and this is my submission for the Keyloop technical assessment.

I chose **Scenario D: The Unified Document Viewer**.

The goal of this scenario is simple:  
a user enters a VIN number, and the system returns one combined list of vehicle documents from two different systems:

- the Sales System
- the Service System

In this video, I will cover:

- my system design
- important implementation choices
- how I worked with AI tools
- a short demo
- and what I learned during this project.

---

## Part 2: System Design Walkthrough (about 1 minutes) - Current Total 1m30s

Now I will explain the architecture in simple steps.

My architecture has three main parts:

1. **Service instance**  
   The Data Aggregator service is designed for horizontal scaling.  
   This means I can run more instances when traffic grows.

2. **Shared infrastructure**  
   Each service instance uses shared components:
   - **PostgreSQL** as the primary database
   - **Redis Cluster** for high-availability caching
   - **Elasticsearch** for log storage
   - **APM Server** for metrics and performance monitoring

3. **External systems**  
   The service connects to two external APIs:
   - Sales System
   - Service System

## Part 3: Implementation Highlights (30s) - Current Total 2m

I focused on backend implementation quality.

Here are the main highlights:

- Parallel data fetching
- Unified output structure
- Dynamic configuration
- Caching with Redis
- Error handling
- Observability with Elasticsearch and APM
- Unit Testing
- AI-assisted development

---

## Part 5: AI Collaboration Story (1m) - Current Total 3m

Now I will explain how I used AI during this project.

I used AI as a **coding assistant**, not as an autopilot.
In my project, I created a folder of prompts and notes to guide my interactions with the AI.

My process had four steps:

1. **Planning with AI**  
   I asked AI for multiple design options and compared trade-offs.

2. **Generating first drafts**  
   I used AI to speed up boilerplate and structure setup, like modules and interface patterns.

3. **Verification and debugging**  
   I manually reviewed all generated code.
   I also improved naming, boundaries, and error paths where needed.

4. **Ownership and quality**  
   Final decisions were mine.

---

## Part 6: Demo Script (about 5 minutes) - Current Total 7m

Now I will do a short demo.

I will make sure all services are running: the Data Aggregator, the Sales System, and the Service System.
Lets me check the 2 external APIs are working by calling their endpoints directly with a sample VIN.

**Step 1 — Register the aggregator config.** - 1m

I send a POST request to `/aggregators` with a name, the VIN param, and source definitions for both the Sales and Service systems.
The service saves the config and returns name to use as an execute endpoint.
As you can see, the config is stored in Postgres.

**Step 2 — Query with a VIN.** - 2m

I call the execute endpoint with a sample VIN: `101`.

The service loads the config, calls both external APIs in parallel, merges the results, and returns one unified document list.

In the response you can see:

- documents from both systems together
- a source label on each item showing where it came from
- and one consistent structure throughout
- status, response time and total item count of each source, total final item count 10 here because in the config I set "remove duplicates" to true and limit to 10.

As you can see, the response time is fast here 900ms, even though source 1 took 500ms and source 2 took 800ms, because they were called in parallel.

I send the same request again. This time it returns instantly from the Redis cache. Only take 50ms.

After 5 seconds, the cache expires. I send the request again, this time it takes 860ms - faster then the first one because the response cache has expired. But the config cache is still valid, so it doesn't need to load from the database.

**Step 3 — Error handling.** - 20s

I send a request with a missing VIN. The API returns a clear validation error with a message. Status 404 Not Found.

**Step 4 — Dynamic data aggregator config.** - 1m

What if the Sales System changes its API? I can update the aggregator config with new source definitions.
For example, Sales System changes its url here and response structure here.
If I call the execute endpoint again, it will say "source 1 failed" and return 0 records.
All I need to do is update the config with the new url and transform function, and then it works again without any code changes.

**Step 5 - Testing.** - 20s

I run the test suite. All tests pass, confirming that core functionality is working as expected.

**Step 6 - Observability.** - 20s
I check the Elasticsearch logs and APM dashboard to see the recorded logs and metrics for my requests.
I can see the performance of each source, error rates, and other useful information for monitoring and debugging.

---

## Part 7: What I Learned and Challenges (about 1 minute) - Current Total 8m

The main challenge was integrating data from two different sources in a clean way.

I learned that:

- caching is a powerful tool for performance
- strong error handling is essential for real systems
- I also learned to use AI better

This project strengthened both my backend engineering and my AI collaboration process.

To close:

- I designed and built a backend solution for Scenario D
- I focused on dynamic configuration,clean architecture, reliability, observability, and testing
- and I used AI in a structured, responsible way with full ownership of the final result.

Thank you for watching.

---
