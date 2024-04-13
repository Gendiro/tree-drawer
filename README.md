# :evergreen_tree: Tree drawer

Small drawer that allows to represent game theory tree from tasks 19-21 of
ege (informatics). It's purpose is to be

<img src="https://i.imgur.com/OWeOekE.png" alt="example 1" style="width: 45%;">
<img src="https://i.imgur.com/6mvgA7V.png" alt="example 2" style="width: 45%;">

## :fire: Functionality

- Draw game theory tree
- Control **recursion depth**, **starting number**, **goal_number** and other numeric values of the task
- **Conditional** recursive branching (e.g. conditions like `(x % 2 == 0) or (x % 3 != 0)` are allowed)
- **Branching** of any size: from 0 to however many you like, supporting all four basic operation (multiplication, division, addition, subtraction) with fractional values
- **Move**, **add** and **connect** nodes as you wish - while the algorithm originally creates the field,
you're the one in control of what happens next - play around and find out!
- **Color identification** of state of position - loss_0, win_1, loss_1, etc.

## :hammer: Building process
Simply install all the elements in one folder and open `index.html` with any modern browser

You can even dump both `main.js` and `style.css` into their respective tags to get a single go-to `index.html`

## :warning: Limitations

This is a quick side project to demonstrate a student a certain task rather than a full-fledged project,
that's why technologies used are simple, code written is rather terrible (it's been done in only two days
with the **idea -> implementation** approach without a hint of refactoring in mind).

The code does most of its thing, however some features you might find essential could be lacking,
or bags from incorrect work of compressor (to make trees a bit less sparse) can occur.