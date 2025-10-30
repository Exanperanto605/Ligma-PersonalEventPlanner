# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e14]:
    - heading "Ligma" [level=1] [ref=e15]
    - generic [ref=e16]: Your Personal Event Planner
    - generic [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]: Email
        - textbox "Email" [ref=e20]:
          - /placeholder: something@email.smth
      - generic [ref=e21]:
        - generic [ref=e22]: Password
        - textbox "Password" [ref=e23]
      - generic [ref=e24]:
        - link "Forgot password?" [ref=e25] [cursor=pointer]:
          - /url: "#"
        - link "Register" [ref=e26] [cursor=pointer]:
          - /url: "#"
      - button "Sign In" [ref=e27] [cursor=pointer]
    - button "Sign In With Google" [ref=e28] [cursor=pointer]
```