$(document).ready(function () {
    menu.events.Init();
});

function MenuFilterButtonsOnClick(element) {
    var buttonCategory = $(element).attr('category');
    menu.GetMenuItens(buttonCategory);
}

var MENU_PAGE_ITENS_LIMIT = 8;
var menu = {
    events: {
        Init: () => {
            menu.GetMenuItens();
        }
    },
    components: {
        CreateMenuItemComponent: (menuItem) => `
            <div class="col-3 mb-5">
                <div class="card card-item" id="${menuItem.id}">
                    <div class="img-produto">
                        <img src="${menuItem.img}"
                            alt="" />
                    </div>
                    <p class="title-produto text-center mt-4">
                        <b>${menuItem.name}</b>
                    </p>
                    <p class="price-produto text-center">
                        <b>R$ ${menuItem.price.toFixed(2).replace('.', ',')}</b>
                    </p>
                    <div class="add-carrinho">
                        <span class="btn-menos" onclick="menu.DecreaseItemAmount('${menuItem.id}')"><i class="fas fa-minus"></i></span>
                        <span class="add-numero-itens" id="qntd-${menuItem.id}">0</span>
                        <span class="btn-mais" onclick="menu.IncreaseItemAmount('${menuItem.id}')"><i class="fas fa-plus"></i></span>
                        <span class="btn btn-add" onclick="menu.AddItemToCart('${menuItem.id}')"><i class="fa fa-shopping-bag"></i></span>
                    </div>
                </div>
            </div>`,
    },
    GetMenuItens: (category = 'burgers') => {
        let menuItens = MENU[category]
            .slice(0, MENU_PAGE_ITENS_LIMIT);

        $('#itensCardapio').html('');

        AddMenuItensComponents(menuItens);

        $('.container-menu a').removeClass('active');
        $('#menu-' + category).addClass('active');

        $('#btnViewMore').removeClass('hidden');
    },
    SeeMoreMenuItens: () => {
        let currentActiveCategory = menu.GetCurrentActiveCategory();

        let menuItens = MENU[currentActiveCategory]
            .slice(MENU_PAGE_ITENS_LIMIT, MENU[currentActiveCategory].length);

        AddMenuItensComponents(menuItens);

        $('#btnViewMore').addClass('hidden');
    },
    GetCurrentActiveCategory: () => {
        return $('.container-menu a.active').attr('category');
    },
    DecreaseItemAmount: (menuItemId) => {
        let currentAmount = menu.GetItemCurrentAmount(menuItemId);

        if (currentAmount == 0) {
            return;
        }

        $('#qntd-' + menuItemId).text(currentAmount - 1);
    },
    IncreaseItemAmount: (menuItemId) => {
        let currentAmount = menu.GetItemCurrentAmount(menuItemId);

        $('#qntd-' + menuItemId).text(currentAmount + 1);
    },
    AddItemToCart: (menuItemId) => {
        let currentAmount = menu.GetItemCurrentAmount(menuItemId);

        if (currentAmount == 0) {
            console.log('It is not possible to add an item without quantity to the cart.');
            return;
        }

        cart.AddItem({
            menuItemId: menuItemId,
            amount: currentAmount
        });

        menu.ResetItemAmount(menuItemId);
    },
    GetItemCurrentAmount: (menuItemId) => {
        return parseInt(
            $('#qntd-' + menuItemId).text()
        );
    },
    ResetItemAmount: (menuItemId) => {
        $('#qntd-' + menuItemId).text(0);
    }
};


var CART_ITENS = [];
var cart = {
    AddItem: ({menuItemId, amount}) => {
        if (cart.AlreadyInCart(menuItemId)) {
            cart.UpdateItem({
                menuItemId: menuItemId,
                amount: amount
            });

            return;
        }

        let currentActiveCategory = menu.GetCurrentActiveCategory();

        var menuItem = GetMenuItemDataById({
            category: currentActiveCategory,
            menuItemId: menuItemId
        });

        menuItem.amount = amount; 

        CART_ITENS.push(menuItem);
    },
    AlreadyInCart: (menuItemId) => {
        return $.grep(CART_ITENS, (menuItem, i) => {
            return menuItem.id == menuItemId
        }).length > 0;
    },
    UpdateItem: ({menuItemId, amount}) => {
        let menuItemCartIndex = CART_ITENS.findIndex((obj => obj.id == menuItemId))
        CART_ITENS[menuItemCartIndex].amount += amount;
    }
}

function AddMenuItensComponents(menuItens) {
    $.each(menuItens, (i, menuItem) => {
        let menuItemComponent = menu
            .components
            .CreateMenuItemComponent(menuItem);

        $('#itensCardapio').append(menuItemComponent);
    });
}

function GetMenuItemDataById({ category, menuItemId }) {
    let menuItens = MENU[category];

    return $.grep(menuItens, (menuItem, i) => {
        return menuItem.id == menuItemId
    })[0];
}
