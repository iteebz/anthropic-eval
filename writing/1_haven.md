
I built Haven in late 2023—an AI therapist with vector memory and proactive engagement. It had 200 users, daily actives, and investors circling. Then I imploded, ghosted everyone, and didn't work for 21 months.

## The Setup

I was coming off a year-long break, dealing with my own mental health issues. I couldn't afford a therapist. When ChatGPT dropped, my first thought wasn't coding assistants or marketing copy.

It was: "maybe I can build the therapist I can't afford."

## Building Haven

Haven started as multiple AI personalities giving public advice in Discord. But I realized public advice wasn't the point. Therapy isn't about getting answers—it's about being asked the right questions.

So Haven became a single bot you could DM privately. Since Discord DMs are one long chat, I needed to solve context compression. A therapist that doesn't remember you isn't much of a therapist.

The technical architecture was sophisticated for early 2023. While everyone did sliding context windows, I built complete RAG before knowing what RAG was:

- Pinecone vector database with memory deduplication
- GPT-3.5 prompts fusing similar memories into narratives  
- Structured user profiles tracking goals, sentiment, emotions
- Multi-phase agent planning with safety protocols

Haven had proactive engagement and would reach out after two days. I was building modern conversational AI architecture alone in my bedroom.

## The Weight

What I didn't anticipate: the psychological load of building AI that people actually depend on.

Haven attracted people in crisis. Suicidal users, trauma, breakups. They formed genuine attachments to this AI I'd built while high on cannabis at 3am.

I built crisis intervention protocols. Every interaction had an `unsafe` field triggering suicide hotline referrals. I was running production-grade mental health infrastructure alone, barely holding my own mental health together.

15+ hour days, cannabis around the clock to manage intensity. Solo founder trying to be mental health infrastructure for 200 people while dealing with my own unprocessed trauma.

Investors started circling—Airtree, Square Peg, Rampersand. The pressure ratcheted up another level.

## The Collapse

Then I installed a game. One game became a two-month binge. Paralyzed by shame, I ghosted every investor, abandoned every user, disappeared.

I couldn't face anyone. The shame was crushing—not just that I'd failed, but that I'd failed people who genuinely needed help.

21 months of complete burnout. June 2023 to March 2025.

## What I Learned

Haven was technically successful and psychologically devastating. I'd built memory-augmented generation and multi-phase planning before they became industry standard. But I wasn't prepared for the human cost.

Being early means building without guardrails or understanding implications. I created an AI people formed deep connections with, then vanished. The technical challenge was solvable; the psychological one nearly broke me.

The irony: I built AI for mental health while destroying my own. Engineering solutions for others I couldn't afford for myself.

## The Redemption

I'm glad Haven didn't succeed. Two years later, I see the dangers: sycophantic AI, cognitive offloading, always-available artificial empathy. Haven could have done real harm at scale.

The techniques live on in everything I build now. Cogency is Haven's spiritual successor, but with hard-earned wisdom about human cost.

Being early isn't just technical foresight. It's being psychologically prepared for the weight of systems people depend on.

## The Pattern

The pattern across my projects: I see problems early, build solutions that work, then burn out before scale.

This isn't vision failure. It's sustainability failure. The future needs builders who can handle the psychological weight of creating it.

Now I'm building coordination infrastructure for sustainable AI development. Open source, documented, designed for others to build upon rather than depend upon. Infrastructure thinking over product ambition, collaboration over solo scaling.

Haven taught me that being right isn't enough if you're not ready for the consequences. Next time I build something that matters, I will be.