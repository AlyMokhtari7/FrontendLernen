'use strict';

// Add event handler for drop-downs for mobile
const drop_down_elements = document.getElementsByClassName('drop-down')
const nav_bar = document.getElementsByTagName('nav')[0];
const burger_menu = document.getElementById('burger-menu');
burger_menu.addEventListener('click', () => toggleNavbar(nav_bar))
burger_menu.onclick = () => toggleNavbar(nav_bar);

var nav_bar_is_hidden = true;

for (let element of drop_down_elements) {
    element.addEventListener('click', toggleDropDown)
    element.onclick = toggleDropDown;
}

function toggleDropDown(e) {
    let isOpen = e.classList.contains('open-drop-down');
    if (isOpen) {
        e.classList.remove('open-drop-down');
        e.classList.add('closed-drop-down');
        e.parentElement.children[1].style.display = 'none';
        e.parentElement.style.border = '1px solid var(--mid-white-smoke)';
        e.parentElement.style.borderRadius = '15px';

    } else {
        e.classList.remove('closed-drop-down');
        e.classList.add('open-drop-down');
        e.parentElement.children[1].style.display = 'flex';
        e.parentElement.style.borderBottom = 'none';
        e.parentElement.style.borderTop = '1px solid var(--mid-white-smoke)';
        e.parentElement.style.borderleft = '1px solid var(--mid-white-smoke)';
        e.parentElement.style.borderRight = '1px solid var(--mid-white-smoke)';
        e.parentElement.style.borderRadius = '15px 15px 0 0';
    }
}

function toggleNavbar() {
    const nav_bar = document.getElementById('nav-list');
    const left_side_nav_bar = document.getElementById('nav-left-side');
    if (!nav_bar_is_hidden) {
        nav_bar_is_hidden = true;
        left_side_nav_bar.style.display = 'none';
        left_side_nav_bar.style.display = 'none';
        for (let i = 1; i < nav_bar.children.length; i++) {
            nav_bar.children[i].style.display = 'none';
        }
    } else {
        nav_bar_is_hidden = false;
        left_side_nav_bar.style.display = 'inline-block';
        left_side_nav_bar.style.display = 'inline-block';
        for (let i = 1; i < nav_bar.children.length; i++) {
            nav_bar.children[i].style.display = 'flex';
        }
    }
}
