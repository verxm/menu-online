var MENU_PAGE_ITENS_LIMIT = 8;

$(document).ready(function () {
    menu.events.Init();
});

function MenuFilterButtonsOnClick(element) {
    var buttonCategory = $(element).attr('category');
    menu.GetMenuItens(buttonCategory);
}

var menu = {
    events: {
        Init: () => {
            menu.GetMenuItens();
        }
    },
    components: {
        CreateMenuItemComponent: (menuItem) => `
            <div class="col-3 mb-5">
                <div class="card card-item">
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
                        <span class="btn-menos"><i class="fas fa-minus"></i></span>
                        <span class="add-numero-itens">0</span>
                        <span class="btn-mais"><i class="fas fa-plus"></i></span>
                        <span class="btn btn-add"><i class="fa fa-shopping-bag"></i></span>
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
        let currentActiveCategory = $('.container-menu a.active').attr('category');

        let menuItens = MENU[currentActiveCategory]
            .slice(MENU_PAGE_ITENS_LIMIT, MENU[currentActiveCategory].length);

        AddMenuItensComponents(menuItens);

        $('#btnViewMore').addClass('hidden');
    }
};

function AddMenuItensComponents(menuItens) {
    $.each(menuItens, (i, menuItem) => {
        let menuItemComponent = menu
            .components
            .CreateMenuItemComponent(menuItem);

        $('#itensCardapio').append(menuItemComponent);
    });
}
