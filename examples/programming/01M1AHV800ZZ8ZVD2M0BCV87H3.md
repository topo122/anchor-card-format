---
id: 01M1AHV800ZZ8ZVD2M0BCV87H3
tags: [rust, ownership]
---

# Assigning a String to a second variable

Why does the compiler reject the last line?

```rust
let a = String::from("hi");
let b = a;
println!("{}", a);
```

<!-- back -->
`let b = a;` moves the `String`. The heap buffer now belongs to `b` and `a` is no longer valid, so reading it is error E0382. `String` owns that buffer and does not implement `Copy`, so nothing was duplicated.

<!-- note -->
The Rust Programming Language, ch. 4.1 "What Is Ownership?".
