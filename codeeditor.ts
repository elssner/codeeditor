// Gib deinen Code hier ein
namespace codeeditor {

    //matrix.init(matrix.ePages.y128)

    // Variablem Deklarationen im Namespace
    let text: Array<string> = [""]
    let cursor_x = 0
    let cursor_y = 0
    let camera_y = 0

    let mode = 0 // 0 = code, 1 = run
    let continue_run = true
    let output: Array<string> = [""]

    /* let startup_text = `
read
jump lp

lp:
jump.eq.0 even
jump.sm.0 odd
push 2
sub
jump lp

even:
print even!
halt

odd:
print odd!
halt
` */

    //codes
    let ARROW_UP = 181
    let ARROW_DOWN = 182
    let ARROW_LEFT = 180
    let ARROW_RIGHT = 183
    let ARROW_KEYS: Array<number> = [ARROW_UP, ARROW_RIGHT, ARROW_DOWN, ARROW_LEFT]
    let ENTER_KEY = 13
    let RETURN_KEY = 8
    let CHAR_LENGTH = 8
    let CHAR_HEIGHT = 8
    let LINES_ON_SCREEN = 16

    //read_program(startup_text)

    //matrix.clearMatrix()
    //matrix.displayMatrix()


    /* export function read_program(text_to_read: string) {
        text = text_to_read.split("\n")
        text.shift()
    } */

    //% block="text"
    export function block_text() { // gibt die Variable text als Block zurück
        return text
    }

    /* input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
        run(text)
    }) */

    //% block="keyboardEvent zeichenCode %zeichenCode zeichenText %zeichenText"
    export function keyboardEvent(zeichenCode: number, zeichenText: string) {
        // pins.onKeyboardEvent(function (zeichenCode: number, zeichenText: string, isASCII: boolean) {
        if (mode == 0) {
            if (ARROW_KEYS.indexOf(zeichenCode) > -1) {
                change_cursor_pos(zeichenCode)
            }
            else if (zeichenCode == ENTER_KEY) {
                text.insertAt(cursor_y + 1, "")
                cursor_y++
                cursor_x = 0
            }
            else if (zeichenCode == RETURN_KEY) {
                if (cursor_x == 0) {
                    if (cursor_y > 0) {
                        text.removeAt(cursor_y)
                        cursor_y -= 1
                        cursor_x = text[cursor_y].length
                    }
                }
                else {
                    text[cursor_y] = [text[cursor_y].slice(0, cursor_x - 1), text[cursor_y].slice(cursor_x)].join('')
                    cursor_x -= 1
                }
            }
            else {
                text[cursor_y] = [text[cursor_y].slice(0, cursor_x), zeichenText, text[cursor_y].slice(cursor_x)].join('')
                cursor_x++
            }

            change_camera_pos()

            matrix.clearMatrix()
            for (let i = camera_y; i < Math.clamp(0, text.length, camera_y + LINES_ON_SCREEN); i++) {
                let j = i - camera_y
                if (i < 9) {
                    matrix.writeTextCharset(j, 0, [["0", (i + 1).toString()].join(""), matrix.matrix_text(text[i])].join(""))
                }
                else {
                    matrix.writeTextCharset(j, 0, [(i + 1).toString(), matrix.matrix_text(text[i])].join(""))
                }
            }
            let local_cursor_y = cursor_y - camera_y
            matrix.line((cursor_x + 2) * CHAR_LENGTH - 1, local_cursor_y * CHAR_HEIGHT, (cursor_x + 2) * CHAR_LENGTH - 1, local_cursor_y * CHAR_HEIGHT + 6)
            matrix.line(2 * CHAR_LENGTH - 2, 0, 2 * CHAR_LENGTH - 2, 128)
            matrix.displayMatrix()
        }

        else if (mode == 1 && !continue_run) {
            if (zeichenCode == ENTER_KEY) { continue_run = true }
            else {
                output[Math.clamp(0, output.length, output.length - 1)] = output[output.length - 1].concat(zeichenText)
                render_output()
            }
        }
    }

    function change_cursor_pos(code: number) {
        if (code == ARROW_UP && cursor_y > 0) {
            cursor_y -= 1
            cursor_x = Math.clamp(0, text[cursor_y].length, cursor_x)
        }
        else if (code == ARROW_DOWN && cursor_y < (text.length - 1)) {
            cursor_y += 1
            cursor_x = Math.clamp(0, text[cursor_y].length, cursor_x)
        }
        else if (code == ARROW_LEFT && cursor_x > 0) {
            cursor_x -= 1
        }
        else if (code == ARROW_RIGHT && cursor_x < (text[cursor_y].length)) {
            cursor_x += 1
        }
    }

    function change_camera_pos() {
        if (cursor_y < camera_y) {
            camera_y = cursor_y
        }
        if (cursor_y > (camera_y + LINES_ON_SCREEN - 1)) {
            camera_y = cursor_y - LINES_ON_SCREEN + 1
        }
    }

    //% block="run %program_lines"
    export function run(program_lines: Array<string>) {
        let program: Array<string> = []
        let token_counter: number = 0
        let label_tracker_names: Array<string> = []
        let label_tracker_data: Array<number> = []

        for (let line = 0; line < program_lines.length; line++) {
            let parts = program_lines[line].split(" ")
            let opcode = parts[0]

            //check if opcode is emtpy
            if (opcode == "") {
                continue
            }

            //check if its a label
            if (opcode.indexOf(":") == opcode.length - 1) {
                label_tracker_names.push(opcode.split(":")[0])
                label_tracker_data.push(token_counter)
                continue
            }

            //store opcode token
            program.push(opcode)
            token_counter++

            //handle opcodes
            if (opcode == "push") {
                let num = parts[1]
                program.push(num)
                token_counter++
            }
            else if (opcode == "print") {
                let string_parts: Array<string> = []
                for (let i = 1; i < parts.length; i++) { string_parts.push(parts[i]) }
                let string_literal = string_parts.join(" ")
                program.push(string_literal)
                token_counter++
            }
            else if (opcode == "jump.eq.0") {
                let label = parts[1]
                program.push(label)
                token_counter++
            }
            else if (opcode == "jump.gt.0") {
                let label = parts[1]
                program.push(label)
                token_counter++
            }
            else if (opcode == "jump.sm.0") {
                let label = parts[1]
                program.push(label)
                token_counter++
            }
            else if (opcode == "jump") {
                let label = parts[1]
                program.push(label)
                token_counter++
            }
        }

        console.log(program)

        //execute program
        mode = 1

        let pc = 0
        let stack = new Stack(256)

        matrix.clearMatrix()
        matrix.displayMatrix()

        while (program[pc] != "halt" && !input.buttonIsPressed(Button.B)) {
            let opcode = program[pc]
            pc++

            if (opcode == "push") {
                let num = program[pc]
                pc++

                stack.push(num)
            }
            else if (opcode == "pop") {
                stack.pop()
            }
            else if (opcode == "add") {
                let a = +stack.pop()
                let b = +stack.pop()
                stack.push((a + b).toString())
            }
            else if (opcode == "sub") {
                let a = +stack.pop()
                let b = +stack.pop()
                stack.push((b - a).toString())
            }
            else if (opcode == "mul") {
                let a = +stack.pop()
                let b = +stack.pop()
                stack.push((b * a).toString())
            }
            else if (opcode == "div") {
                let a = +stack.pop()
                let b = +stack.pop()
                stack.push((b / a).toString())
            }
            else if (opcode == "print") {
                let string_literal = program[pc]
                pc++
                output.push(string_literal)
                render_output()
            }
            else if (opcode == "read") {
                continue_run = false
                while (!continue_run) {
                    pins.raiseKeyboardEvent(true)
                }
                stack.push(output[output.length - 1])
            }
            else if (opcode == "jump.eq.0") {
                let num = stack.top()
                if (num == "0") {
                    pc = label_tracker_data[label_tracker_names.indexOf(program[pc])]
                }
                else {
                    pc++
                }
            }
            else if (opcode == "jump.gt.0") {
                let num = stack.top()
                if (+num > 0) {
                    pc = label_tracker_data[label_tracker_names.indexOf(program[pc])]
                }
                else {
                    pc++
                }
            }
            else if (opcode == "jump.sm.0") {
                let num = stack.top()
                if (+num < 0) {
                    pc = label_tracker_data[label_tracker_names.indexOf(program[pc])]
                }
                else {
                    pc++
                }
            }
            else if (opcode == "jump") {
                pc = label_tracker_data[label_tracker_names.indexOf(program[pc])]
            }
            else if (opcode == "printtop") {
                output.push(stack.top())
                render_output()
            }
        }

        console.log("Finished!")
        basic.pause(1000)
        mode = 0
        output = [""]
    }

    function render_output() {
        while (output.length > 16) {
            output.shift()
        }

        matrix.clearMatrix()
        for (let i = 0; i < output.length; i++) {
            matrix.writeTextCharset(i, 0, matrix.matrix_text(output[i]))
        }
        matrix.displayMatrix()
    }

    class Stack {
        private buf: Array<string>;
        private sp: number;

        constructor(size: number) {
            this.buf = [];
            for (let i = 0; i < size; i++) { this.buf.push("0") }
            this.sp = -1;
        }

        push(num: string) {
            this.sp++;
            this.buf[this.sp] = num;
        }

        pop() {
            let num = this.buf[this.sp]
            this.sp--
            return num
        }

        top() {
            return this.buf[this.sp]
        }
    }


    /* loops.everyInterval(50, function () {
        pins.raiseKeyboardEvent(true)
    }) */


}