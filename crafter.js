// ==UserScript==
// @name         ESC
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  удобный авто-крафт с кулдаунами
// @author       arturwol
// @match        https://egg-surprise.shop/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      egg-surprise.shop
// @updateURL    https://raw.githubusercontent.com/arturwo1/EggSurpriseCrafter/main/crafter.js
// @downloadURL  https://raw.githubusercontent.com/arturwo1/EggSurpriseCrafter/main/crafter.js
// ==/UserScript==

(function() {
    'use strict';

    const BASE_URL = "https://egg-surprise.shop/api";
    const CRAFT_URL = `${BASE_URL}/craft/start`;
    const token = localStorage.getItem('access_token');
    const recipes = JSON.parse(localStorage.getItem('recipes')) || []; // формат: [{"item_id":0,"amount":0,"cooldown":1000}]

    const main_menu_position = JSON.parse(localStorage.getItem('position')) || [250,10];
    main_menu_position[0] = typeof main_menu_position[0] === 'number' && !isNaN(main_menu_position[0]) ? main_menu_position[0] : 250;
    main_menu_position[1] = typeof main_menu_position[1] === 'number' && !isNaN(main_menu_position[1]) ? main_menu_position[1] : 10;

    let isRunning = false;

    const main_menu = document.createElement('button');
    main_menu.id = 'main_menu';
    document.body.appendChild(main_menu);

    // Добавление картинки в кнопку
    const img = document.createElement('img');
    img.src = 'https://egg-icons.fra1.cdn.digitaloceanspaces.com/old/egg_surprise/items/Farm_Egg.png';
    img.alt = 'Craft Button';
    img.style.objectFit = 'contain';
    img.style.width = '100%';
    img.style.height = '100%';
    main_menu.appendChild(img);

    // Создание меню
    const menu = document.createElement('div');
    menu.id = 'menu';
    menu.style.display = 'none';
    menu.style.position = 'absolute';
    menu.style.top = main_menu.style.top+main_menu.offsetHeight;
    menu.style.left = main_menu.style.left;
    menu.style.backgroundColor = '#005e9d';
    menu.style.border = '1px solid #ccc';
    menu.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    menu.style.borderRadius = '1vh';
    menu.style.width = '20vw';
    menu.style.height = '35vh';
    menu.style.zIndex = 99998;
    main_menu.appendChild(menu);

    // Заголовок меню
    const menu_title = document.createElement('div');
    menu_title.id = 'menu_title';
    menu_title.style.position = 'absolute';
    menu_title.style.top = '2%';
    menu_title.style.left = '5%';
    menu_title.style.backgroundColor = 'rgb(0 79 131)';
    menu_title.style.color = 'white';
    menu_title.style.fontSize = '14px';
    menu_title.style.fontWeight = 'bold';
    menu_title.style.textAlign = 'center';
    menu_title.style.width = '90%';
    menu_title.style.height = '10%';
    menu_title.style.display = 'flex';
    menu_title.style.alignItems = 'center';
    menu_title.style.justifyContent = 'center';
    menu_title.style.border = '1px solid #000000';
    menu_title.style.borderRadius = '1vh';
    menu_title.style.zIndex = 99999;
    menu_title.innerHTML = 'Auto-crafts';
    menu.appendChild(menu_title);

    // скроллбар
    const scrollbar = document.createElement('div');
    scrollbar.id = 'scrollbar';
    scrollbar.style.position = 'absolute';
    scrollbar.style.top = '15%';
    scrollbar.style.left = '5%';
    scrollbar.style.backgroundColor = 'rgb(0 79 131)';
    scrollbar.style.width = '90%';
    scrollbar.style.height = '82%';
    scrollbar.style.alignItems = 'flex-start';
    scrollbar.style.justifyContent = 'flex-start';
    scrollbar.style.border = '1px solid #000000';
    scrollbar.style.borderRadius = '1vh';
    scrollbar.style.zIndex = 99999;
    scrollbar.style.overflowY = 'auto';
    scrollbar.style.overflowX = 'hidden';
    scrollbar.style.padding = '1vh';
    menu.appendChild(scrollbar);

    // Крафты
    if (recipes.length > 0) {
        let topPosition = 2;

        recipes.forEach(item => {
            const { item_id, amount, cooldown } = item;

            const autocraft_item = document.createElement('div');
            autocraft_item.id = item_id+amount+cooldown;
            autocraft_item.style.width = '100%';
            autocraft_item.style.height = '50%';
            autocraft_item.style.backgroundColor = 'rgb(0 79 131)';
            autocraft_item.style.padding = '1vh';
            autocraft_item.style.border = '1px solid #000000';
            autocraft_item.style.borderRadius = '1vh';
            autocraft_item.style.marginBottom = '1vh';
            autocraft_item.style.color = 'white';
            autocraft_item.style.fontSize = '14px';
            autocraft_item.style.fontWeight = 'bold';
            autocraft_item.style.textAlign = 'left';
            autocraft_item.style.display = 'flex';
            autocraft_item.style.flexDirection = 'column';
            autocraft_item.style.justifyContent = 'center';
            autocraft_item.style.gap = '1vh';
            autocraft_item.innerHTML = `
            Item ID: ${item_id}<br>
            Item amount: ${amount}<br>
            Item cooldown: ${cooldown}
            `;
            scrollbar.appendChild(autocraft_item)
        });
    }

    // Добавить крафт
    const autocraft_item = document.createElement('button');
    autocraft_item.id = 'autocraft_item';
    autocraft_item.style.width = '100%';
    autocraft_item.style.height = '17%';
    autocraft_item.style.backgroundColor = '#4caf50';
    autocraft_item.style.padding = '1.5vh';
    autocraft_item.style.border = '1px solid #000000';
    autocraft_item.style.borderRadius = '1vh';
    autocraft_item.style.marginBottom = '1vh';
    autocraft_item.style.color = '#025b06';
    autocraft_item.style.fontSize = '17px';
    autocraft_item.style.webkitTextStroke = '0.5px white';
    autocraft_item.style.fontWeight = '900';
    autocraft_item.style.textAlign = 'center';
    autocraft_item.style.display = 'flex';
    autocraft_item.style.flexDirection = 'column';
    autocraft_item.style.justifyContent = 'center';
    autocraft_item.style.alignItems = 'stretch';
    autocraft_item.style.gap = '1vh';
    autocraft_item.innerHTML = `Add new craft`;
    scrollbar.appendChild(autocraft_item)

    // start-stop
    const start_stop = document.createElement('button');
    start_stop.id = 'start_stop';
    start_stop.style.position = 'absolute';
    start_stop.style.left = '5%';
    start_stop.style.top = '104%';
    start_stop.style.width = '90%';
    start_stop.style.height = '14%';
    start_stop.style.backgroundColor = '#4caf50';
    start_stop.style.padding = '1.5vh';
    start_stop.style.border = '1px solid #000000';
    start_stop.style.borderRadius = '1vh';
    start_stop.style.marginBottom = '1vh';
    start_stop.style.color = '#025b06';
    start_stop.style.fontSize = '17px';
    start_stop.style.webkitTextStroke = '0.5px white';
    start_stop.style.fontWeight = '900';
    start_stop.style.textAlign = 'center';
    start_stop.style.display = 'flex';
    start_stop.style.flexDirection = 'column';
    start_stop.style.justifyContent = 'center';
    start_stop.style.alignItems = 'stretch';
    start_stop.style.gap = '1vh';
    start_stop.innerHTML = `Start`;
    menu.appendChild(start_stop)

    // Стилизация кнопки
    const style = document.createElement('style');
    style.innerHTML = `
    #main_menu {
        position: fixed;
        top: ${main_menu_position[0]}px;
        left: ${main_menu_position[1]}px;
        background-color: #ffffff;
        border: none;
        border-radius: 1vh;
        cursor: grab;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        width: 5vw;  //
        height: 5vh; //
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;  // Устанавливаем высокий z-index, чтобы кнопка была поверх всех элементов
    }

    #main_menu:active {
        cursor: grabbing;
    }

    #main_menu img {
        pointer-events: none;  // Запрещаем перетаскивание картинки
    }

    #menu {
        display: none; /* Скрыто по умолчанию */
    }
    `;
    document.head.appendChild(style);

    // Логика перетаскивания кнопки
    let offsetX, offsetY, isDragging = false;

    main_menu.addEventListener('mousedown', (e) => {
        if (e.target == main_menu) {
            isDragging = true;
            offsetX = e.clientX - main_menu.getBoundingClientRect().left;
            offsetY = e.clientY - main_menu.getBoundingClientRect().top;
            main_menu.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            main_menu.style.left = `${e.clientX - offsetX}px`;
            main_menu.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        main_menu.style.cursor = 'grab';

        const newTop = parseInt(main_menu.style.top);
        const newLeft = parseInt(main_menu.style.left);
        localStorage.setItem("position", JSON.stringify([newTop, newLeft]));
    });

    // Обработчик клика на кнопку для отображения/скрытия меню
    main_menu.addEventListener('click', (e) => {
        if (main_menu.style.cursor!='grabbing' && e.target == main_menu){
            const isMenuVisible = menu.style.display === 'block';
            menu.style.display = isMenuVisible ? 'none' : 'block';
        }
    });

    autocraft_item.addEventListener('click', (e) => {
        const userInput = prompt("Ввод текста: ",JSON.stringify(recipes));
        if (userInput) {
            alert(`Успешно сохранено!
Если будут ошибки при крафте, посмотрите правильно ли вы ввели здесь значение и измените его!`);
            localStorage.setItem("recipes", JSON.stringify(JSON.parse(userInput)));
        }
        recipes = JSON.parse(userInput)
    });

})();
