# ADR 1. Use Feature-Sliced Design as our architecture

Status: Active

## Context

The existing architecture is:

-   Not scalable
    -   Component granularity is lacking (all components divided into `components` and `pages`)
-   Difficult to navigate
    -   There's no knowledge of our domain
    -   Different folders have the same purpose (`context`/`contexts`)
    -   There's a lot of unused code (`old` folder)

We care about flexibility and scalability.

## Decision

Use [Feature-Sliced Design](https://feature-sliced.design/) as the base of our architecture methodology, with some modifications.

## Consequence

-   Our code structure follows the Feature-Sliced Design layers, slices and segments. (Find more details in [our code structure docs](../code-structure.md)).
-   We have clear responsibilities that are isolated from each other.
-   Our business logic is explicit.
-   There is some learning curve for developers not familiar with the architecture.
