COMPANY_WHATSAPP_NUMBER = '555199028748';

$(document).ready(function () {
    menu.events.Init();
});

function MenuFilterButtonsOnClick(element) {
    var buttonCategory = $(element).attr('category');
    menu.LoadItems(buttonCategory);
}

function OpenCart(open) {
    if (open) {
        $('#modalCarrinho').removeClass('hidden');

        cart
            .StepHandlers
            .CartStep
            .Load();;
    }
    else {
        $('#modalCarrinho').addClass('hidden');
    }
}

const MENU_PAGE_ITENS_LIMIT = 8;
var menu = {
    events: {
        Init: () => {
            menu.LoadItems();
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
                        <b>R$ ${NormalizePrice(menuItem.price)}</b>
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
    LoadItems: (category = 'burgers') => {
        let menuItens = MENU[category]
            .slice(0, MENU_PAGE_ITENS_LIMIT);

        $('#itensCardapio').html('');

        menu.AddItemComponents(menuItens);

        $('.container-menu a').removeClass('active');
        $('#menu-' + category).addClass('active');

        $('#btnViewMore').removeClass('hidden');
    },
    SeeMoreMenuItens: () => {
        let currentActiveCategory = menu.GetCurrentActiveCategory();

        let menuItens = MENU[currentActiveCategory]
            .slice(MENU_PAGE_ITENS_LIMIT, MENU[currentActiveCategory].length);

        menu.AddItemComponents(menuItens);

        $('#btnViewMore').addClass('hidden');
    },
    AddItemComponents: (menuItens) => {
        $.each(menuItens, (i, menuItem) => {
            let menuItemComponent = menu
                .components
                .CreateMenuItemComponent(menuItem);

            $('#itensCardapio').append(menuItemComponent);
        });
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
            NotifyError('Não é possível adicionar um item sem quantidade ao carrinho');
            return;
        }

        var addedMenuItem = cart.AddItem({
            menuItemId: menuItemId,
            amount: currentAmount
        });

        cart.UpdateTotalItems();

        menu.ResetItemAmount(menuItemId);

        NotifySuccess(`${currentAmount} ${addedMenuItem.name} adicionado(s) ao carrinho.`);
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
    components: {
        CreateCartItemComponent: (cartItem) => {
            return `
                <div class="col-12 item-carrinho">
                    <div class="img-produto">
                        <img src="${cartItem.img}">
                    </div>
                    <div class="dados-produto">
                        <p class="title-produto"><b>${cartItem.name}</b></p>
                        <p class="price-produto"><b>R$ ${NormalizePrice(cartItem.price)}</b></p>
                    </div>
                    <div class="add-carrinho">
                        <span class="btn-menos" onclick="cart.DecreaseItemAmount('${cartItem.id}')"><i class="fas fa-minus"></i></span>
                        <span class="add-numero-itens" id="qntd-carrinho-${cartItem.id}">${cartItem.amount}</span>
                        <span class="btn-mais" onclick="cart.IncreaseItemAmount('${cartItem.id}')"><i class="fas fa-plus"></i></span>
                        <span class="btn btn-remove" onclick="cart.RemoveItem('${cartItem.id}')"><i class="fa fa-times"></i></span>
                    </div>
                </div>`
        },
        CreateSummaryItemComponent: (cartItem) => {
            return `
                <div class="col-12 item-carrinho resumo">
                    <div class="img-produto-resumo">
                        <img
                            src="${cartItem.img}">
                    </div>
                    <div class="dados-produto">
                        <p class="title-produto-resumo">
                            <b>${cartItem.name}</b>
                        </p>
                        <p class="price-produto-resumo">
                            <b>R$ ${NormalizePrice(cartItem.price)}</b>
                        </p>
                    </div>
                    <p class="quantidade-produto-resumo">
                        x <b>${cartItem.amount}</b>
                    </p>
                </div>`
        }
    },
    AddItem: ({ menuItemId, amount }) => {
        let existingCartItem = cart.GetItem(menuItemId)
        if (existingCartItem != null && existingCartItem != undefined) {
            let newAmount = existingCartItem.amount + amount;

            let updatedCartItem = cart.UpdateItem({
                cartItemId: menuItemId,
                amount: newAmount
            });

            return updatedCartItem;
        }

        let currentActiveCategory = menu.GetCurrentActiveCategory();

        let menuItem = GetMenuItemDataById({
            category: currentActiveCategory,
            menuItemId: menuItemId
        });

        menuItem.amount = amount;

        CART_ITENS.push(menuItem);

        return menuItem;
    },
    GetItem: (cartItemId) => {
        return $.grep(CART_ITENS, (cartItem, i) => {
            return cartItem.id == cartItemId
        })[0];
    },
    UpdateItem: ({ cartItemId, amount }) => {
        let menuItemCartIndex = CART_ITENS.findIndex((obj => obj.id == cartItemId))
        CART_ITENS[menuItemCartIndex].amount = amount;

        return CART_ITENS[menuItemCartIndex];
    },
    UpdateTotalItems: () => {
        var total = cart.GetTotalItems();

        cart.UpdateTotalItemAmountDisplay(total);
        cart.LoadTotalPrices();
    },
    GetTotalItems: () => {
        let result = 0;
        $.each(CART_ITENS, (i, e) => {
            result += e.amount;
        });

        return result;
    },
    UpdateTotalItemAmountDisplay: (total) => {
        if (total > 0) {
            $('.cart-button').removeClass('hidden');
            $('.container-total-carrinho').removeClass('hidden');
        }
        else {
            $('.cart-button').addClass('hidden');
            $('.container-total-carrinho').addClass('hidden');
        }

        $('.badge-total-carrinho').html(total);
    },
    BackStep: () => {
        let step = $('.etapa.active').length;

        let targetStepNumber = step - 1;
        let stepName = $('.etapa' + targetStepNumber).attr('step-name');

        cart.LoadStep(stepName);
    },
    LoadStep: (step) => {
        cart
            .StepHandlers[step]
            .Load();
    },
    Steps: {
        CART_STEP: 'CartStep',
        ADDRESS_STEP: 'AddressStep',
        SUMMARY_STEP: 'SummaryStep'
    },
    StepHandlers: {
        CartStep: {
            Load: () => {
                cart
                    .StepHandlers
                    .CartStep
                    .DisplayForm();

                cart
                    .StepHandlers
                    .CartStep
                    .LoadItems();
            },
            DisplayForm: () => {
                $('#lblTituloEtapa').text('Seu carrinho:');
                $('#itensCarrinho').removeClass('hidden');
                $('#localEntrega').addClass('hidden');
                $('#resumoCarrinho').addClass('hidden');

                $('.etapa').removeClass('active');
                $('.etapa1').addClass('active');

                $('#btnEtapaPedido').removeClass('hidden');
                $('#btnEtapaEndereco').addClass('hidden');
                $('#btnEtapaResumo').addClass('hidden');
                $('#btnVoltar').addClass('hidden');
            },
            LoadItems: () => {
                if (CART_ITENS.length === 0) {
                    $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>');
                    return;
                }
        
                $("#itensCarrinho").html('');
        
                cart
                    .StepHandlers
                    .CartStep
                    .AddItemComponents(CART_ITENS);
                    
                cart.LoadTotalPrices();
            },
            AddItemComponents: (cartItems) => {
                $.each(cartItems, (i, cartItem) => {
                    let cartItemComponent = cart
                        .components
                        .CreateCartItemComponent(cartItem);
        
                    $("#itensCarrinho").append(cartItemComponent);
                });
            }
        },
        AddressStep: {
            Load: () => {
                if (cart.IsEmpty()) {
                    NotifyError("Adicione itens ao carrinho para continuar")
                    return;
                }

                $('#lblTituloEtapa').text('Endereço de entrega:');
                $('#itensCarrinho').addClass('hidden');
                $('#localEntrega').removeClass('hidden');
                $('#resumoCarrinho').addClass('hidden');

                $('.etapa').removeClass('active');
                $('.etapa1').addClass('active');
                $('.etapa2').addClass('active');

                $('#btnEtapaEndereco').removeClass('hidden');
                $('#btnVoltar').removeClass('hidden');
                $('#btnEtapaPedido').addClass('hidden');
                $('#btnEtapaResumo').addClass('hidden');
            },
            GetAddressByZipCode: () => {
                let zipCode = NormalizeZipCode($('#txtCEP').val());

                if (zipCode === "" || zipCode === undefined || zipCode === null) {
                    NotifyInformation("Informe o CEP, por favor");
                    $('#txtCEP').focus();

                    return;
                }

                if (ZipCodeFormatIsInvalid(zipCode)) {
                    NotifyError("Formato do CEP inválido");
                    return;
                }

                $.getJSON(`https://viacep.com.br/ws/${zipCode}/json/?callback=`, function (response) {
                    if ("error" in response) {
                        NotifyError("CEP não encontrado. Preencha as informações manualmente");
                        $('#txtEndereço').focus();
                        return;
                    }

                    $('#txtEndereço').val(response.logradouro);
                    $('#txtBairro').val(response.bairro);
                    $('#txtCidade').val(response.localidade);
                    $('#ddlUf').val(response.uf);

                    $('#txtNumero').focus();
                });
            },
            IsValid: (address) => {
                // TODO: Melhorar essa validação
                if (address.cep.length <= 0) {
                    NotifyError("Informe o CEP, por favor.")
                    $('#txtCEP').focus();
                    return false;
                }

                if (address.endereco.length <= 0) {
                    NotifyError("Informe o endereço, por favor.")
                    $('#txtEndereço').focus();
                    return false;
                }

                if (address.bairro.length <= 0) {
                    NotifyError("Informe o bairro, por favor.")
                    $('#txtBairro').focus();
                    return false;
                }

                if (address.cidade.length <= 0) {
                    NotifyError("Informe a cidade, por favor.")
                    $('#txtCidade').focus();
                    return false;
                }

                if (address.uf == -1) {
                    NotifyError("Informe a UF, por favor.")
                    $('#ddlUf').focus();
                    return false;
                }

                if (address.numero.length <= 0) {
                    NotifyError("Informe a número, por favor.")
                    $('#txtNumero').focus();
                    return false;
                }

                return true;
            },
            GetFormData: () => {
                return {
                    cep: $('#txtCEP').val().trim(),
                    endereco: $('#txtEndereço').val().trim(),
                    bairro: $('#txtBairro').val().trim(),
                    cidade: $('#txtCidade').val().trim(),
                    uf: $('#ddlUf').val().trim(),
                    numero: $('#txtNumero').val().trim(),
                    complemento: $('#txtComplemento').val().trim(),
                }
            }
        },
        SummaryStep: {
            Load: () => {
                var address = cart.StepHandlers.AddressStep.GetFormData();

                if (!cart.StepHandlers.AddressStep.IsValid(address)) {
                    return;
                }

                cart.Address = address;

                cart
                    .StepHandlers
                    .SummaryStep
                    .DisplayForm();
                
                cart
                    .StepHandlers
                    .SummaryStep
                    .LoadItems();

                cart
                    .StepHandlers
                    .SummaryStep
                    .LoadAddressSummary();
            },
            LoadAddressSummary: () => {
                $('#resumoEndereco').html(cart.GeneratePrimaryAddressText());
                $('#cidadeEndereco').html(cart.GenerateSecondaryAddressText())
            },
            DisplayForm: () => {
                $('#lblTituloEtapa').text('Resumo do pedido:');
                $('#itensCarrinho').addClass('hidden');
                $('#localEntrega').addClass('hidden');
                $('#resumoCarrinho').removeClass('hidden');

                $('.etapa').removeClass('active');
                $('.etapa1').addClass('active');
                $('.etapa2').addClass('active');
                $('.etapa3').addClass('active');

                $('#btnEtapaResumo').removeClass('hidden');
                $('#btnVoltar').removeClass('hidden');
                $('#btnEtapaEndereco').addClass('hidden');
                $('#btnEtapaPedido').addClass('hidden');
            },
            LoadItems: () => {
                $("#listaItensResumo").html('');

                cart
                    .StepHandlers
                    .SummaryStep
                    .AddItemComponents(CART_ITENS);
            },
            AddItemComponents: (cartItems) => {
                $.each(cartItems, (i, cartItem) => {
                    let cartItemComponent = cart
                        .components
                        .CreateSummaryItemComponent(cartItem);
        
                    $("#listaItensResumo").append(cartItemComponent);
                });
            }
        },
    },
    Address: null,
    GeneratePrimaryAddressText: () => {
        return `${cart.Address.endereco}, ${cart.Address.numero} ${cart.Address.complemento}, ${cart.Address.bairro}`;
    },
    GenerateSecondaryAddressText: () => {
        return `${cart.Address.cidade}-${cart.Address.uf} / ${cart.Address.cep}`;
    },
    IsEmpty: () => {
        return CART_ITENS.length <= 0;
    },
    DecreaseItemAmount: (cartItemId) => {
        let currentAmount = cart.GetItemCurrentAmount(cartItemId);
        let newAmount = currentAmount - 1;

        cart.UpdateItem({
            cartItemId: cartItemId,
            amount: newAmount
        })
        cart.UpdateTotalItems();

        if (currentAmount === 1) {
            cart.RemoveItem(cartItemId);
            return;
        }

        $('#qntd-carrinho-' + cartItemId).text(newAmount);
    },
    IncreaseItemAmount: (cartItemId) => {
        let currentAmount = cart.GetItemCurrentAmount(cartItemId);
        let newAmount = currentAmount + 1;

        cart.UpdateItem({
            cartItemId: cartItemId,
            amount: newAmount
        });
        cart.UpdateTotalItems();

        $('#qntd-carrinho-' + cartItemId).text(newAmount);
    },
    GetItemCurrentAmount: (cartItemId) => {
        return parseInt(
            $('#qntd-carrinho-' + cartItemId).text()
        );
    },
    RemoveItem: (cartItemId) => {
        // TODO: Melhorar essa remoção para que não seja necessário manipular toda lista e recarregar o componente inteiro
        // A ideia é ter uma remoção da tela mais elegante e a remoção única do item do array
        CART_ITENS = $.grep(CART_ITENS, (e, i) => {
            return e.id != cartItemId
        });

        cart
            .StepHandlers
            .CartStep
            .Load();

        cart.UpdateTotalItems();
    },
    LoadTotalPrices: () => {
        $('#lblSubTotal').text('R$ 0,00');
        $('#lblValorEntrega').text('+ R$ 0,00');
        $('#lblValorTotal').text('R$ 0,00');

        if (CART_ITENS.length <= 0) {
            console.log("The total prices could not be loaded into the cart because the cart is empty.");
            return;
        }

        let itemsTotalPrice = cart.GetItemsTotalPrice();

        $('#lblSubTotal').text(`R$ ${NormalizePrice(itemsTotalPrice)}`);
        $('#lblValorEntrega').text(`+ R$ ${NormalizePrice(cart.DeliveryPrice)}`);
        $('#lblValorTotal').text(`R$ ${NormalizePrice(cart.GetTotalPrice(itemsTotalPrice))}`);
    },
    DeliveryPrice: 5,
    GetItemsTotalPrice: () => {
        let result = 0;

        $.each(CART_ITENS, (i, cartItem) => {
            let itemTotalPrice = parseFloat(cartItem.price * cartItem.amount);
            result += itemTotalPrice;
        });

        return result;
    },
    GetTotalPrice: (itemsTotalPrice = null) => {
        if (itemsTotalPrice == null || itemsTotalPrice == undefined) {
            itemsTotalPrice = cart.GetItemsTotalPrice();
        }

        return itemsTotalPrice + cart.DeliveryPrice;
    },
    FinalizeOrder: () => {
        if (CART_ITENS.length <= 0) {
            NotifyError('Adicione algum produto ao carrinho para finalizar seu pedido');
            return;
        }

        let orderSummaryText = cart.GenerateOrderSummaryText();

        let whatsAppMessageUri = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURI(orderSummaryText)}`

        window.open(whatsAppMessageUri, '_blank');
    },
    GenerateOrderSummaryText: () => {
        let cartItemsSummaryText = cart.GenerateCartItemsSummaryText();

        let result = 'Olá! Gostaria de fazer um pedido:\n\n';
        result += `*Itens do pedido:*\n${cartItemsSummaryText}`;
        result += '\n*Endereço de entrega:*';
        result += `\n${cart.GeneratePrimaryAddressText()}`;
        result += `\n${cart.GenerateSecondaryAddressText()}`;
        result += `\n\n*Total (com entrega): R$ ${NormalizePrice(cart.GetTotalPrice())}*`;

        return result;
    },
    GenerateCartItemsSummaryText: () => {
        let result = '';

        $.each(CART_ITENS, (i, e) => {
            result += `*${e.amount}x* ${e.name} ....... R$ ${NormalizePrice(e.price)} \n`;
        });

        return result;
    }
}

function GetMenuItemDataById({ category, menuItemId }) {
    let menuItens = MENU[category];

    return $.grep(menuItens, (menuItem, i) => {
        return menuItem.id == menuItemId
    })[0];
}

var SUCCESS_COLOR_CLASS_NAME = 'green';
function NotifySuccess(message, timeInMs = 3500) {
    NotifyUser({
        message: `<i class="notification-icon fas fa-check-circle"></i> ${message}`,
        color: SUCCESS_COLOR_CLASS_NAME,
        timeInMs: timeInMs
    });
}

var ERROR_COLOR_CLASS_NAME = 'red';
function NotifyError(message, timeInMs = 3500) {
    NotifyUser({
        message: `<i class="notification-icon fas fa-times-circle"></i> ${message}`,
        color: ERROR_COLOR_CLASS_NAME,
        timeInMs: timeInMs
    });
}

var INFORMATION_COLOR_CLASS_NAME = 'gray';
function NotifyInformation(message, timeInMs = 3500) {
    NotifyUser({
        message: `<i class="notification-icon fas fa-exclamation-circle"></i> ${message}`,
        color: INFORMATION_COLOR_CLASS_NAME,
        timeInMs: timeInMs
    });
}

function NotifyUser({ message, timeInMs, color }) {
    let randomId = Math.floor(Date.now() * Math.random()).toString();

    let messageComponent = `<div id="msg-${randomId}" class="animated fadeInDown toast ${color}">${message}</div>`;
    $('#container-mensagens').append(messageComponent);

    setTimeout(() => {
        $('#msg-' + randomId).removeClass('fadeInDown');
        $('#msg-' + randomId).addClass('fadeOutUp');

        setTimeout(() => {
            $('#msg-' + randomId).remove();
        }, 800);
    }, timeInMs);
}

function NormalizePrice(price) {
    return price.toFixed(2).replace('.', ',');
}

function NormalizeZipCode(zipCode) {
    return KeepsOnlyNumericCharacters(zipCode);
}

function KeepsOnlyNumericCharacters(text) {
    return text
        .trim()
        .replace(/\D/g, '');
}

const ZIP_CODE_FORMAT_REGEX = /^[0-9]{8}$/;
function ZipCodeFormatIsInvalid(zipCode) {
    return !ZIP_CODE_FORMAT_REGEX.test(zipCode);
}