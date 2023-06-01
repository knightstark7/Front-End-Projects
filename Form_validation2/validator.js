function Validator(formSelector) {
    var _this = this
    var formRules = {}


    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }



    /**
     * Quy ước tạo rules:
     * - Nếu có lỗi thì return `error message`
     * - Nếu không có lỗi thì return `undefined`
     */


    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này';
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập email';
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`;
            }
        },
        max: function(max) {
            return function(value) {
                return value.length <= min ? undefined : `Vui lòng nhập tối đa ${max} kí tự`;
            }
        },
    }

    var ruleName = 'required'


    //Láy ra form element trong DOM theo `formSelector`
    var formElement = document.querySelector(formSelector)

    //Chỉ xử lí khi có element trong DOM
    if(formElement) {

        var inputs = formElement.querySelectorAll('[name][rules]')

        for(var input of inputs) {
            
            var rules = input.getAttribute('rules').split('|')
            for(var rule of rules) {
                var ruleInfo
                var isRuleHasValue = rule.includes(':')

                if(isRuleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunc = validatorRules[rule]

                if(isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            //Lắng nghe sự kiện để validate (input, blur, change, ...)

            input.onblur = handleValidate
            input.oninput = handleClearError

        }
        
        // Hàm thực hiện validate
        function handleValidate(event) {
            var rules = formRules[event.target.name]
            var errorMessage

            for(var rule of rules) {
                errorMessage = rule(event.target.value)
                if(errorMessage) break
            }   


            // Nếu có lỗi thì hiển thị message lỗi ra UI
            if(errorMessage) {

                var formGroup = getParent(event.target, '.form-group')
                if(formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message')
                    if(formMessage) {
                        formMessage.innerText = errorMessage
                    }
                }
            }
            return !errorMessage
        }

        //Hàm clear message lỗi
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group')
            if(formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message')

                    if(formMessage) {
                        formMessage.innerText = ''
                    }
            }
        }
    }

    //Xử lí hành vi submit form submit
    formElement.onsubmit = function(event) {
        event.preventDefault()

        var inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true
        for(var input of inputs) {
            if(!handleValidate({ target: input })) {
                isValid = false
            }
        }

        // Khi không có lỗi thì submit form
        if(isValid) {
            if(typeof _this.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]') //Lấy các thẻ có field là name
                var formValues = Array.from(enableInputs).reduce(function(values, input) {
                    switch(input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                            break
                        case 'checkbox':
                            if(!input.matches(':checked')) {
                                values[input.name] = ''
                                return values;
                            }
                            if(!Array.isArray(values[input.name])) {
                                values[input.name] = []
                            }
                            values[input.name].push(input.value)
                            break
                        case 'file': 
                            values[input.name] = input.files
                            break
                        default:
                            values[input.name] = input.value
                    }

                    return values
                }, {})

                // Gọi lại hàm onSubmit và trả về kèm giá trị của form
                _this.onSubmit(formValues)
            } else {
                formElement.submit()
            }
        }
    }
}

/**
 * Fix bugs:
 * - find method
 * - onSubmit method
 */