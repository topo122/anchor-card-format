---
id: 01M1AJ3KJGSRARYCGNTB1ZMEWV
tags: [rust, borrow-checker]
---

# Holding a reference into a Vec across a push

Element 0 is never removed, so why is this rejected?

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4);
println!("{}", first);
```

<!-- back -->
`first` is an immutable borrow of `v` that is still live at the `println!`, and `push` needs a mutable borrow of the same `Vec`. A push may reallocate the buffer and move the elements, which would leave `first` dangling, so the borrow checker rejects the overlap without asking whether this particular push would have grown the vector.

![[01M1AHZDS80R75970R3E2RQSYX]]

<!-- note -->
The Rust Programming Language, ch. 8.1 "Storing Lists of Values with Vectors".
