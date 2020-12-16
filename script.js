"use strict";
//задаём размер поля, по умолчанию 3
let size = 3;

//забираем HTML эл-ты со страницы 
//выбор размера поля
let sizeThree = document.querySelector("#sizeThree");
let sizeFour = document.querySelector("#sizeFour");
let sizeFife = document.querySelector("#sizeFife");
let sizeSix = document.querySelector("#sizeSix");

let shuffleEl = document.querySelector("#shuffle");
let restartEl = document.querySelector("#restart");
let newGameEl = document.querySelector("#newGame");

let imgInp = document.querySelector("input");
let start = document.querySelector("#start");

//создаем переменные для аудио
let au = document.querySelector('#audio');
let au1 = document.querySelector('#audio1');
let playing = false; // текущее состояние плеера
let player = new Audio('audio.mp3');
player.preload = "auto";

let url = "img/ng.jpg";


class AllTilesClass {
    emptyTilePos = 0;  //тут будет храниться индекс пустой клетки в массиве поля tilesArray
    tilesArray = [];
    randomSave = [];
    numMoves = 0;  //кол-во ходов

    constructor() {
        this.newBoard();
        this.tiles = Array.from(document.querySelectorAll(".img"));
        //заполняем массив поля от 0 до 8
        for (let i = 0; i < size * size; i++) {
            this.tilesArray.push(i);
        }
    }

    //рисуем поле по заданному размеру
    newBoard() {
        for (let i = 0; i < size; i++) {
            
            let divRow = document.createElement("div");
            divRow.className = 'row';
            
            for (let j = 0; j < size; j++) {
                let divCol = document.createElement("button");
                divRow.appendChild (divCol);
                divCol.className = 'col img';
                divCol.id = 'tile' + (i * size + j);
                divCol.style.backgroundPosition = this.computeBGByCoord(i, j);
                divCol.style.backgroundImage = "url(" + url + ")";
                divCol.style.paddingBottom = 100/size + '%';
                divCol.style.opacity = '1';
                divCol.style.backgroundSize = size * 100 + '%';
            }
            document.querySelector(".content").appendChild(divRow);
        }
        let emptyTileHTML= document.querySelector('#tile' + (size * size - 1));
        emptyTileHTML.style.opacity = '0';
    }

    //метод отрисовки плашек
    render() {
        //присваиваем стили к плашкам на поле соответсвенно перестановкам в массиве поля tilesArray
        this.tiles.forEach((tile, index) => {
            tile.style.backgroundPosition = this.computeBGByIndex(this.tilesArray[index]);
            tile.style.opacity = '1';
        });
        this.tiles[this.emptyTilePos].style.opacity = '0';
    }

    //метод для смешивания плашек
    random() {
        //фунция для перемешивания плашек
        const shuffledKeys = () => { 
            this.tilesArray.sort(function(){
                return Math.random() - 0.5;
            });
        };
        //перемешиваем до тех пор пока не получим собираемую комбинацию
        do {
            shuffledKeys();  
            this.randomSave = [...this.tilesArray];
        }      
        while (this.inversionCount(this.tilesArray) % 2 == 1 || this.inversionCount(this.tilesArray) == 0) 
        //записываем позицию пустой клетки 
        this.emptyTilePos = this.tilesArray.indexOf(size * size - 1);
        this.render();
        this.unlockTiles();
    }

    // метод проверки на выигрышь
    isComplete() {
        //проверяем отсортирован ли попорядку масссив tilesArray
        const isWin = this.tilesArray.reduce((isWin, tile, index) => {
            return isWin && tile == index;
        }, true);

        if (isWin) {
            document.querySelector("h4").innerHTML = "Ура! Победа!";
    
            //убираем рамки и дорисовываем картинку
            const noBorder = this.tiles 
            .forEach(tile => {
                tile.style.border = 'none';
                this.tiles[this.emptyTilePos].style.opacity = '1';
                document.activeElement.blur();
                tile.disabled = true;
            });      
        }
    }

    //  Метод замены выбранной плашки и пустой
    change(event) {
        let tile = event.target;
        //записываем позицию клетки, на кот нажали
        let currentTilePos = +tile.id.replace('tile', '');
        
        //меняем значения нажатой плашки и пустой в массиве номеров полей 
        let tmp = this.tilesArray[currentTilePos];
        this.tilesArray[currentTilePos] = this.tilesArray[this.emptyTilePos];
        this.tilesArray[this.emptyTilePos] = tmp;
        //присваиваем новый номер пустой клетки
        this.emptyTilePos = currentTilePos;
        this.render();
        this.unlockTiles();
        this.isComplete();

        //подсчёт кол-ва ходов
        this.numMoves++;
        document.querySelector("#moves").innerHTML = this.numMoves;
        
    }
    // метод разблокировки и блокировки активных плашек относительно пустой
    unlockTiles () {
        // перебираем плашки и берем их индексы, сравниваем с индексом пустой и разблокируем и блокируем по формуле
        this.tiles.forEach((tile, index) => {
            if ((index == this.emptyTilePos + 1 && this.emptyTilePos % size != size - 1) || 
            (index == this.emptyTilePos - 1 && this.emptyTilePos % size != 0) || 
            index == this.emptyTilePos + size || index == this.emptyTilePos - size) {
                tile.disabled = false;
            } else {
                tile.disabled = true;
            }
        });
    }

    // метод подсчёта перестановок (комбинация имеет решение, если это число чётное)
    inversionCount(array) {
	// Использование функции reduce для просмотра всех элементов в массиве
    // Для каждого элемента массива считается количество элементов стоящих после него и меньше него (число перестановок для элемента)
    // Возвращаем общее число перестановок
        return array.reduce((accumulator, current, index, array) => {

                let add = 0;
                if (current == size * size -1) { //если встретилась пустая клетка и size чётное, то записываем номер её строки
                    if (size % 2 == 0) {
                        add = Math.floor(index / size);
                    } 
                } else {
                    add = array.slice(index)
                            .filter(item => {
                                return item < current;
                            }).length;
                }
                return accumulator + add;
            }, 0);
            
        }

    //запуск новой игры
    shuffle() {
        this.numMoves = 0;
        document.querySelector("#moves").innerHTML = this.numMoves;

        this.random();
        document.querySelector("h4").innerHTML = "Собери картинку";
    
        //возвращаем рамки и дорисовываем картинку
        const noBorder = this.tiles 
        .forEach(tile => {
            tile.style.border = '1px solid rgb(105, 23, 23)';
            document.activeElement.focus();
        });  
    }

    //запуск заново той же комбинации
    restart() {
        this.numMoves = 0;
        document.querySelector("#moves").innerHTML = this.numMoves;
        document.querySelector("h4").innerHTML = "Собери картинку";
        
        this.tilesArray = [...this.randomSave];
        this.emptyTilePos = this.tilesArray.indexOf(size * size - 1);
        this.render();
        this.unlockTiles();

        //возвращаем рамки и дорисовываем картинку
        const noBorder = this.tiles 
        .forEach(tile => {
            tile.style.border = '1px solid rgb(105, 23, 23)';
            document.activeElement.focus();
        });  
    }

    //функция возврата на главный экран для новоц игры
    newGame() {
        document.querySelector(".startToy").removeAttribute('hidden');
        document.querySelector(".toy").setAttribute('hidden','');
        document.querySelector(".content").innerHTML = '';
        url = "img/ng.jpg";
        userMiniImg.setAttribute('src', url);
        imgInp.value = "";
        document.querySelector(".custom-file-label").innerHTML = 'Выбери файл';
        this.numMoves = 0;
        document.querySelector("#moves").innerHTML = this.numMoves;
    }
        
    //функция расчёта позиций бэкраунда 
    computeBGByIndex(index) {
        return this.computeBGByCoord(Math.floor(index / size), index % size);
    }
    
    //функция расчёта позиции бэкграунда 
    computeBGByCoord(i, j) {
        return j * 100 / (size - 1) + '% ' + i * 100 / (size - 1) + '%';
    }
}

sizeThree.addEventListener("click", sizeChoice);
sizeFour.addEventListener("click", sizeChoice);
sizeFife.addEventListener("click", sizeChoice);
sizeSix.addEventListener("click", sizeChoice);

au.addEventListener('click', playPause); 
au1.addEventListener('click', playPause); 

//вызов фнкции загрузки изображения 
imgInp.addEventListener("change", readURL);

start.addEventListener("click", mainFun); //начало игры

//основная функция
function mainFun() {
    
    document.querySelector(".startToy").setAttribute('hidden','');
    document.querySelector(".toy").removeAttribute('hidden');

    //Создаем экземпляр класса AllTilesClass
    const AllTiles = new AllTilesClass();

    //привязываем this для функций к объекту
    let random = AllTiles.random.bind(AllTiles);
    let change = AllTiles.change.bind(AllTiles);
    let shuffle = AllTiles.shuffle.bind(AllTiles);
    let restart = AllTiles.restart.bind(AllTiles);
    let newGame = AllTiles.newGame.bind(AllTiles);

    //запускаем функцию рандом чеpез 1 с после загрузки страницы
    setTimeout(random, 1000); 

    shuffleEl.addEventListener("click", shuffle);
    restartEl.addEventListener("click", restart);
    newGameEl.addEventListener("click", newGame);
    
    //"слушаем" каждую плашку на нажатие и запускаем смену картинки
    AllTiles.tiles.forEach(tile => {
        tile.addEventListener("click", change);
    });
}

//заупск или приостановки проигрывания аудио
function playPause() {
    if( playing) {
        player.pause();
        document.querySelector('#auOnOff').innerText = "Включить музыку";
        au1.classList.remove('text-white');
        au1.classList.add('text-dark');

    } else {
        player.play();
        document.querySelector('#auOnOff').innerText = "Выключить музыку";
        au1.classList.remove('text-dark');
        au1.classList.add('text-white');
    }
    playing = !playing;
}

// Функция загрузки собственного файла
function readURL(event) {
    let input = event.target;
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        let userMiniImg = document.querySelector("#userMiniImg");

        reader.onload = function(e) {
            userMiniImg.setAttribute('src', e.target.result);
            url = e.target.result;
            //подклбчение библиотеки для отображения названия файла при загрузке
            bsCustomFileInput.init()
        }
        reader.readAsDataURL(input.files[0]);
    }
}

//функция выбора размера 
function sizeChoice (event) {
    switch (event.target) {
        case sizeThree:
            document.querySelector("#sizePoint").innerHTML = '3 X 3';
            size = 3;
            break;
        case sizeFour:
            document.querySelector("#sizePoint").innerHTML = '4 X 4';
            size = 4;
            break;    
        case sizeFife:
            document.querySelector("#sizePoint").innerHTML = '5 X 5';
            size = 5;
            break;
        case sizeSix:
            document.querySelector("#sizePoint").innerHTML = '6 X 6';
            size = 6;
            break;
        default:    
            size = 3;
    }        
}


