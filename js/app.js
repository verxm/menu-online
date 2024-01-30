$(document).ready(function () {
    menu.events.Init();
});

// TODO: Refatorar para sparar propriedades desse objeto. Não fazem sentido estarem em um objeto para mim. Está gerando referência circular para o mesmo objeto.
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

    // TODO: Adicionar documentação de método aqui (pesquisar lib)
    // Get all menu itens list
    GetMenuItens: (category = 'burgers') => {
        var menuItens = MENU[category]

        $('#itensCardapio').html('');

        $.each(menuItens, (i, menuItem) => {
            let menuItemComponent = menu
                .components
                .CreateMenuItemComponent(menuItem);

            $('#itensCardapio').append(menuItemComponent);
        });

        $('.container-menu a').removeClass('active');
        $('#menu-' + category).addClass('active')
    }
};