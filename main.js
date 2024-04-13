function distance_to(other_object) {
    return Math.sqrt((this.x - other_object.x)**2 + (this.y - other_object.y)**2);
}

class SelectDot {
    constructor(origin_node) {
        this.distance_to = distance_to;

        this.x = origin_node.x;
        this.y = origin_node.y;
        this.relative_x = 0;
        this.relative_y = 0;

        this.origin_node = origin_node;
        this.object= document.createElement("div");
        this.object.className = "dot";
        this.origin_node.object.appendChild(this.object);
    }
    move_to(x, y) {
        this.x = x;
        this.y = y;
        this.relative_x = this.x - this.origin_node.x + this.origin_node.radius - 5;
        this.relative_y = this.y - this.origin_node.y + this.origin_node.radius - 5;

        this.object.style.left = this.relative_x + 'px';
        this.object.style.top = this.relative_y + 'px';
    }
    on_state() {
        this.object.style.left = this.relative_x - 5 + 'px';
        this.object.style.top = this.relative_y - 5 + 'px';
        this.object.style.width = "20px";
        this.object.style.height = "20px";
    }
    off_state() {
        this.object.style.left = this.relative_x + 'px';
        this.object.style.top = this.relative_y + 'px';
        this.object.style.width = "10px";
        this.object.style.height = "10px";
    }
}

class Node {
   constructor(text) {
       this.value = text;
       this.distance_to = distance_to;

       this.radius = 40;
       this.x = 50;
       this.y = 50;

       this.connections = [];

       this.object = document.createElement("div");
       this.object.textContent = text;
       this.object.className = "circle";
       document.body.appendChild(this.object);

       this.dotObjects = [];
       for (let i = 0; i < 8; i++) {
            let new_dot = new SelectDot(this);
           this.dotObjects.push(new_dot);
       }
       this.move_to(this.x, this.y);
   }

   move_to(x, y) {
       this.x = x + this.radius;
       this.y = y + this.radius;
       this.object.style.left = x + 'px';
       this.object.style.top = y + 'px';

       const angleStep = (2 * Math.PI) / this.dotObjects.length;
       for (let i = 0; i < this.dotObjects.length; i++) {
           const angle = i * angleStep;
           const dotX = Math.cos(angle) * this.radius + this.radius;
           const dotY = Math.sin(angle) * this.radius + this.radius;
           this.dotObjects[i].move_to(x + dotX, y + dotY);
       }

       for (let connection of this.connections) {
           connection.update_coords();
       }
   }

   on_select_state() {
       for (let dot of this.dotObjects) {
           dot.object.style.display = "block";
       }
   }
   off_select_state() {
        for (let dot of this.dotObjects) {
            dot.object.style.display = "none";
            dot.off_state();
        }
   }
   get_dot(dot_position) {
       const conn_positions = {
           'right': 0,
           'down-right': 1,
           'down': 2,
           'down-left': 3,
           'left': 4,
           'top-left': 5,
           'top': 6,
           'top-right': 7
       };
      return this.dotObjects[conn_positions[dot_position]];
   }
   set_color(color) {
      this.object.style.borderColor = color;
      this.object.style.color = color;
      this.object.style.borderWidth = '4px';
   }
   set_color_by_result(outcome, turn) {
        switch(outcome + " " + turn) {
            case "loss 0":
                this.set_color("green");
                break;
            case "win 1":
                this.set_color("orange");
                break;
            case "loss 1":
                this.set_color("blue");
                break;
            case "win 2":
                this.set_color("brown");
                break;
        }
   }
   remove() {
       for (let dot of this.dotObjects) dot.object.remove();
       this.object.remove();
   }
}

class Connection {
    constructor(start_con, end_con) {
        this.start = start_con;
        this.end = end_con;

        if (start_con.hasOwnProperty('origin_node')) {
            start_con.origin_node.connections.push(this);
        }
        if (end_con.hasOwnProperty('origin_node')) {
            end_con.origin_node.connections.push(this);
        }

       this.object = document.createElement("div");
       this.object.className = 'connection';
       let distance = start_con.distance_to(end_con);
       this.object.style.height = distance + 'px';

       this.object.style.left = start_con.x + 'px';
       this.object.style.top = start_con.y + 'px';

       this.angle = Math.atan2(end_con.y - start_con.y, end_con.x - start_con.x) * 180 / Math.PI - 90;
       this.object.style.transform = `rotate(${this.angle}deg)`;

       document.body.appendChild(this.object);
    }
    update_coords() {
        this.object.style.left = this.start.x + 2 + 'px';
        this.object.style.top = this.start.y + 'px';

        let distance = this.start.distance_to(this.end);
        this.object.style.height = distance + 'px';

        this.angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x) * 180 / Math.PI - 90;
        this.object.style.transform = `rotate(${this.angle}deg)`;
    }
    remove() {
        this.object.remove();
    }
}

class Dot {
    constructor(x, y) {
        this.distance_to = distance_to;
        this.x = x;
        this.y = y;
    }
    move_to(x, y) {
        this.x = x;
        this.y = y;
    }
}

let cur_picked_node = -1;
let cur_picked_dot = null;
let cursor_connection = null;
let cursor_dot = null;
let x_diff = -1;
let y_diff = -1;


let nodes = []
let connections = []

function onMouseDown(event) {
    for (let node of nodes) {
        x_diff = event.pageX - node.x;
        y_diff = event.pageY - node.y;
        if (x_diff**2 + y_diff**2 <= node.radius**2) {
            cur_picked_node = nodes.indexOf(node);
            break;
        }
        let from_radius = Math.sqrt(Math.abs(x_diff**2 + y_diff**2 - node.radius**2));
        if (0 <= from_radius && from_radius <= 25) {
            node.on_select_state();
            for (let dot of node.dotObjects) {
                let dot_x_diff = event.pageX - dot.x;
                let dot_y_diff = event.pageY - dot.y;
                if (dot_x_diff**2 + dot_y_diff**2 <= 40) {
                    dot.on_state();
                    cur_picked_dot = dot;
                    cursor_dot = new Dot(dot.x, dot.y);
                    cursor_connection = new Connection(cur_picked_dot, cursor_dot);
                    break;
                }
            }
        }
    }
}

function onMouseMove(event) {
   if (cur_picked_node !== -1) {
       let node = nodes[cur_picked_node];
       node.move_to(event.pageX - node.radius - x_diff, event.pageY - node.radius - y_diff);
   }
   if (cursor_dot !== null) {
       cursor_dot.move_to(event.pageX, event.pageY);
       cursor_connection.update_coords();
   }
}

function onMouseUp(event) {
    cur_picked_node = -1;
    x_diff = 0;
    y_diff = 0;
    for (let node of nodes) {
        node.off_select_state();
        x_diff = event.pageX - node.x;
        y_diff = event.pageY - node.y;

        let from_radius = Math.sqrt(Math.abs(x_diff**2 + y_diff**2 - node.radius**2));
        if (0 <= from_radius && from_radius <= 25) {
            for (let dot of node.dotObjects) {
                let dot_x_diff = event.pageX - dot.x;
                let dot_y_diff = event.pageY - dot.y;
                if (dot_x_diff**2 + dot_y_diff**2 <= 40) {
                    if (cur_picked_dot && cur_picked_dot.origin_node !== dot.origin_node) {
                        let new_connection = new Connection(cur_picked_dot, dot);
                        connections.push(new_connection);
                    }
                    break;
                }
            }
        }
    }
    cur_picked_dot = null;
    cursor_dot = null;
    if (cursor_connection !== null) {
        cursor_connection.remove();
    }
    cursor_connection = null;
}

function solver(prev_node, turns_left) {
    const prev_value = parseInt(prev_node.value);
    let found_loss = 10**10;
    let found_win = -1;
    let possible_moves = [];
    let next_moves_down = 0;
    let loss_0_count = 0;
    for (let [op_num, operation] of operations.entries()) {
        if (conditions[op_num](prev_value)) possible_moves.push(operation);
    }
    let new_nodes = [];
    for (let move of possible_moves) {
        const new_value = move(prev_value);
        let new_node;
        if (turns_left > 0) {
            new_node = new Node(new_value.toString());
            new_nodes.push(new_node);
            nodes.push(new_node);
            let new_conn = new Connection(prev_node.get_dot('right'),
                new_node.get_dot('left'));
            connections.push(new_conn);
            const new_x = prev_node.x + 100;
            const new_y = prev_node.y + operations.length ** (turns_left - 1) * 100 * operations.indexOf(move) - new_node.radius - next_moves_down;
            new_node.move_to(new_x, new_y);
        }
        if ((mode && new_value < goal_num) || (!mode && new_value > goal_num)) {
            let result, val;
            if (turns_left > 0) {
                let next_moves_down_fut;
                [result, val, next_moves_down_fut] = solver(new_node, turns_left - 1);
                next_moves_down += next_moves_down_fut;
            }
            else [result, val] = vanilla_solver(new_value);
            if (result === "loss") {
                found_loss = Math.min(found_loss, val);
            } else {
                found_win = Math.max(found_win, val);
            }
        }
        else {
            if(turns_left > 0) new_node.set_color_by_result("loss", 0);
            if(turns_left > 1) {
                new_node.move_to(new_node.x - new_node.radius, new_node.y - new_node.radius - 100);
                next_moves_down = operations.length ** (turns_left - 1) * 100;
                for (let i = turns_left - 1; i > 1; i--)
                    next_moves_down += operations.length ** (i - 1) * 100;
                loss_0_count++;
            }
            found_loss = 0;
        }
    }
    if (loss_0_count === possible_moves.length)
        for (let [id, node] of new_nodes.entries())
           node.move_to(prev_node.x + 100, prev_node.y - prev_node.radius + id * 100);
    let result;
    if (found_loss !== 10**10)
        result = ["win", found_loss + 1, next_moves_down];
    else
        result = ["loss", found_win, next_moves_down];
    if (turns_left >= 0) prev_node.set_color_by_result(result[0], result[1]);
    return result;
}

const vanilla_solver_cache = {};
function vanilla_solver(prev_value) {
    if (prev_value in vanilla_solver_cache) {
        return vanilla_solver_cache[prev_value];
    }
    let found_loss = 10**10;
    let found_win = 0;
    for (let [op_num, operation] of operations.entries()) {
        const new_value = operation(prev_value);
        if ((mode && new_value < goal_num) || (!mode && new_value > goal_num)) {
            const [result, val] = vanilla_solver(new_value);
            (result === "loss") ? found_loss = Math.min(found_loss, val) : found_win = Math.max(found_win, val);
        } else {
            found_loss = 0;
        }
    }
    const answer = [(found_loss !== 10**10) ? "win" : "loss", (found_loss !== 10**10) ? found_loss + 1 : found_win];
    vanilla_solver_cache[prev_value] = answer;
    return answer;
}

function handleNewNode(event) {
   let new_node = new Node(add_new_element_text.value);
   nodes.push(new_node);
}

function resetEverything() {
    for (let conn of connections) conn.remove();
    for (let node of nodes) node.remove();
    connections = [];
    original_node = new Node(start_num.toString());
    original_node.move_to(50, 50);
    nodes = [original_node];
}

function handleNewRecursionDepth(event) {
    recursion_depth = parseInt(recursion_depth_text.value);
    resetEverything();
    solver(original_node, recursion_depth);
}

function handleNewStartNumber(event) {
   start_num = parseInt(start_num_text.value);
   resetEverything();
   solver(original_node, recursion_depth);
}

function handleNewGoalNumber(event) {
    goal_num = parseInt(goal_num_text.value);
    resetEverything();
    solver(original_node, recursion_depth);
}

function stringToFunction(operation_string) {
    const operator = operation_string.charAt(0);
    const operand = parseFloat(operation_string.slice(1));

    switch(operator) {
        case '+':
            return x => x + operand;
        case '-':
            return x => x - operand;
        case '*':
            return x => Math.ceil(x * operand);
        case '/':
            return x => x / operand;
        case '%':
            return x => x % operand;
        default:
            throw new Error("Invalid operation string.");
    }
}

function stringToCondition(condition_string) {
    if (condition_string === "" || condition_string === "true") return _ => true;
    if (condition_string === "false") return _ => false;
    const conditions = condition_string.split(/\sand\s|\sor\s/);

    const condition_functions = conditions.map(condition => {
        if (condition.includes(' and ')) {
            return condition.split(' and ').map(subCondition => stringToCondition(subCondition));
        } else if (condition.includes(' or ')) {
            return condition.split(' or ').map(subCondition => stringToCondition(subCondition));
        } else {
            const [variable, operator, value, eq_sign, result] = condition.split(/\s+/);
            return function(x) {
                let answer = true;
                switch (operator) {
                    case '+':
                        answer = x + parseInt(value) === parseInt(result);
                        break;
                    case '-':
                        answer = x - parseInt(value) === parseInt(result);
                        break;
                    case '/':
                        answer = x / parseInt(value) === parseInt(result);
                        break;
                    case '%':
                        answer = x % parseInt(value) === parseInt(result);
                        break;
                    default:
                        throw new Error('Invalid operator');
                }
                if (eq_sign === "==")
                    return answer;
                else if (eq_sign === "!=")
                    return !answer;
                return new Error("Invalid equal sign");
            };
        }
    });

    return function(x) {
        return condition_functions.every(condition => {
            if (Array.isArray(condition)) {
                if (condition.some(subCondition => subCondition(x))) {
                    return true;
                }
            } else {
                return condition(x);
            }
        });
    };
}

function handleChangeOperation(event) {
    const operation_id = parseInt(event.target.id.slice(10));
    operations[operation_id] = stringToFunction(event.target.value);
    resetEverything();
    solver(original_node, recursion_depth);
}

function handleChangeCondition(event) {
    const condition_id = parseInt(event.target.id.slice(10));
    conditions[condition_id] = stringToCondition(event.target.value);
    resetEverything();
    solver(original_node, recursion_depth);
}

function handleDeleteOperation(event) {
   const operation_id = parseInt(event.target.id.slice(7));
   operation_divs[operation_id].remove();
   for (let i = operation_id + 1; i < operations.length; i++) {
       operations[i-1] = operations[i];
       conditions[i-1] = conditions[i];
       operation_divs[i-1] = operation_divs[i];
   }
   operations.pop();
   conditions.pop();
   operation_divs.pop();
   for (let i = 0; i < operation_divs.length; i++) {
       operation_divs[i].id = `operation-${i}`;
       const children = operation_divs[i].children;
       for (let j = 0; j < children.length; j++)
           children[j].id = `${children[j].id.split('-')[0]}-${i}`;
   }
   resetEverything();
   solver(original_node, recursion_depth);
}

function handleNewOperation(event) {
    const new_operation = document.createElement("div");
    new_operation.className = 'operation';
    const new_condition = document.createElement("input");
    const last_id = operations.length;
    new_condition.id = `condition-${last_id}`;
    new_condition.type = "text";
    conditions[last_id] = _ => true;
    new_condition.addEventListener('change', handleChangeCondition);
    const new_operation_input = document.createElement("input");
    new_operation_input.id = `operation-${last_id}`;
    new_operation_input.type = "text";
    new_operation_input.addEventListener('change', handleChangeOperation);
    const new_delete = document.createElement("button");
    new_delete.textContent = 'X';
    new_delete.addEventListener('click', handleDeleteOperation);
    new_delete.id = `delete-${last_id}`;
    new_operation.appendChild(new_condition);
    new_operation.appendChild(new_operation_input);
    new_operation.appendChild(new_delete);
    operation_divs.push(new_operation);
    operations_div.appendChild(new_operation);
}

function handleChangeMode(event) {
    mode = !mode;
    if (mode) {
        event.target.style.backgroundColor = "#28a745";
        event.target.textContent = "Increasing";
    }
    else {
        event.target.style.backgroundColor = "red";
        event.target.textContent = "Decreasing";
    }
    resetEverything();
    solver(original_node, recursion_depth);
}

let original_node;

add_new_element_text = document.getElementById("value-add-new-equation");
add_new_element_button = document.getElementById("add-new-equation");
add_new_element_button.addEventListener("click", handleNewNode);

let mode = true;
const mode_button = document.getElementById("mode");
mode_button.addEventListener('click', handleChangeMode);
mode_button.style.backgroundColor = "#28a745";

let recursion_depth = 4;
recursion_depth_text = document.getElementById("value-recursion-depth");
recursion_depth_text.value = recursion_depth;
recursion_depth_text.addEventListener("change", handleNewRecursionDepth);

let start_num = 5;
start_num_text = document.getElementById("value-start-num");
start_num_text.value = start_num;
start_num_text.addEventListener("change", handleNewStartNumber);

let goal_num = 22;
goal_num_text = document.getElementById("value-goal-num");
goal_num_text.value = goal_num;
goal_num_text.addEventListener("change", handleNewGoalNumber);

document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);

let operations = [x => x + 1, x => x * 2];
let conditions = [_ => true, _ => true];
let operation_divs = [];

operations_div = document.getElementById('operations');
for (let [id, operation] of operations.entries()) {
    let operation_string = operation.toString();
    operation_string = operation_string.slice(operation_string.indexOf('=>') + 5).trim();
    const new_operation = document.createElement("div");
    new_operation.className = "operation";
    const new_condition = document.createElement("input");
    new_condition.id = `condition-${id}`;
    new_condition.type = "text";
    let condition_string = conditions[id].toString();
    condition_string = condition_string.slice(condition_string.indexOf('=>') + 3).trim();
    if (condition_string === "true") condition_string = "";
    new_condition.value = condition_string;
    new_condition.addEventListener('change', handleChangeCondition);
    const new_operation_input = document.createElement("input");
    new_operation_input.id = `operation-${id}`;
    new_operation_input.value = operation_string;
    new_operation_input.type = "text";
    new_operation_input.addEventListener('change', handleChangeOperation);
    const new_delete = document.createElement("button");
    new_delete.textContent = 'X';
    new_delete.addEventListener('click', handleDeleteOperation);
    new_delete.id = `delete-${id}`;
    new_operation.appendChild(new_condition);
    new_operation.appendChild(new_operation_input);
    new_operation.appendChild(new_delete);
    operations_div.appendChild(new_operation);
    operation_divs.push(new_operation);
}

const add_new_operation_button = document.getElementById("add-new-operation");
add_new_operation_button.addEventListener("click", handleNewOperation);

const results = Array(4).fill([]);

original_node = new Node(start_num.toString());
original_node.move_to(50, 50);
nodes.push(original_node);
solver(original_node, recursion_depth);