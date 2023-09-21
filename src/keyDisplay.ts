export const W = 'w'
export const A = 'a'
export const S = 's'
export const D = 'd'
export const CONTROL = 'control'
export const SPACE = ' '

export const DIRECTIONS = [W, S, A, D]

export class KeyDisplay {
    map: Map<string, HTMLDivElement> = new Map()

    constructor() {

        //tworzenie elementów html
        const w: HTMLDivElement = document.createElement("div")
        const a: HTMLDivElement = document.createElement("div")
        const s: HTMLDivElement = document.createElement("div")
        const d: HTMLDivElement = document.createElement("div")
        const control: HTMLDivElement = document.createElement("div")
        const space: HTMLDivElement = document.createElement("div")

        //dodanie elementow do naszej mapy
        this.map.set(W, w)
        this.map.set(A, a)
        this.map.set(S, s)
        this.map.set(D, d)
        this.map.set(CONTROL, control)
        this.map.set(SPACE, space)

        // ustawienie każdego elementów ( ustawienie koloru, rozmiaru czcionki, grubosc czcionki, pozycjonowanie absolutne, zawartość tekstu)
        this.map.forEach((v, k) => {
            v.style.color = '#000000'
            v.style.fontWeight = '800'
            v.style.position = 'absolute'
            v.className = 'button'
            // v.style.width =

            if (k == ' '){
                v.textContent = 'jump'
                v.style.width = '120px'
            }
            else if (k == 'control')
                v.textContent = "running"
                
            else{
                v.textContent = k
                v.style.width = '20px'
            }

        })

        this.setPosition()

        this.map.forEach((v, _) => {
            document.body.append(v) //dodaj przyciski na strone
        })
    }

    public setPosition() {
        //ustawienie elementów
        //ustawienie margin top
        this.map.get(W).style.top = `${50}px`
        this.map.get(A).style.top = `${100}px`
        this.map.get(S).style.top = `${100}px`
        this.map.get(D).style.top = `${100}px`
        this.map.get(CONTROL).style.top = `${window.innerHeight - 100}px`
        this.map.get(SPACE).style.top = `${150}px`


        let half = window.innerWidth / 2
        //ustawienie ich na srodku ekranu
        this.map.get(W).style.left = `${100}px`
        this.map.get(A).style.left = `${50}px`
        this.map.get(S).style.left = `${100}px`
        this.map.get(D).style.left = `${150}px`

        this.map.get(CONTROL).style.left = `50px`
        this.map.get(SPACE).style.left = `${50}px`

    }

    public down(key: string) {
        if (this.map.get(key.toLowerCase())) {
            if (key.toLowerCase() == 'control') {
                var text = this.map.get(key.toLowerCase()).textContent;
                if (text === "running") {
                    text = "walking";
                } else {
                    text = "running";
                }
                this.map.get(key.toLowerCase()).textContent = text;
            }
            this.map.get(key.toLowerCase()).style.color = '#ffffff'
        }
    }

    public up(key: string) {
        if (this.map.get(key.toLowerCase())) {
            this.map.get(key.toLowerCase()).style.color = "#000000"
        }
    }
}
