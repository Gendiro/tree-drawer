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
       this.distance_to = distance_to;

       this.radius = 50;
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
        this.object.style.left = this.start.x + 'px';
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
        x_diff = event.clientX - node.x;
        y_diff = event.clientY - node.y;
        if (x_diff**2 + y_diff**2 <= node.radius**2) {
            cur_picked_node = nodes.indexOf(node);
            break;
        }
        let from_radius = Math.sqrt(Math.abs(x_diff**2 + y_diff**2 - node.radius**2));
        if (0 <= from_radius && from_radius <= 25) {
            node.on_select_state();
            for (let dot of node.dotObjects) {
                let dot_x_diff = event.clientX - dot.x;
                let dot_y_diff = event.clientY - dot.y;
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
       node.move_to(event.clientX - node.radius - x_diff, event.clientY - node.radius - y_diff);
   }
   if (cursor_dot !== null) {
       cursor_dot.move_to(event.clientX, event.clientY);
       cursor_connection.update_coords();
   }
}

function onMouseUp(event) {
    cur_picked_node = -1;
    x_diff = 0;
    y_diff = 0;
    for (let node of nodes) {
        node.off_select_state();
        x_diff = event.clientX - node.x;
        y_diff = event.clientY - node.y;

        let from_radius = Math.sqrt(Math.abs(x_diff**2 + y_diff**2 - node.radius**2));
        if (0 <= from_radius && from_radius <= 25) {
            for (let dot of node.dotObjects) {
                let dot_x_diff = event.clientX - dot.x;
                let dot_y_diff = event.clientY - dot.y;
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

function handleNewNode(event) {
   let new_node = new Node(add_new_element_text.value);
   nodes.push(new_node);
}

add_new_element_text = document.getElementById("value-add-new-equation");
add_new_element_button = document.getElementById("add-new-equation");
add_new_element_button.addEventListener("click", handleNewNode);

document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);
