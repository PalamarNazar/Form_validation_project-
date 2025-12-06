class UserForm {
    selectors = {
        form: '[data-user-form]',
        errorForm: '[data-error-field]',
        infoForm: '[data-info-form]',
        infoFormError: '[data-info-error]',
    }

    errorMessages = {
        patternMismatch: ( { pattern }) => pattern === '^\\S+$' 
        ? 'Field musn\'t contain spaces' 
        : `Password must be 8–12 characters long, 
            include at least one lowercase letter, 
            one uppercase letter, one digit, one special character (!@#$%^&*_), 
            and must not contain any spaces.`,

        tooShort: ({ minLength }) => `Content must be at least ${minLength} charactrs long`,   
        valueMissing: () => 'This field must be filled in',
    }

    constructor() {
        this.bindEvent()
    }

    manageErrors(fieldElement, error) {
        const isRequiredElement = fieldElement.required
        const infoForm = fieldElement.closest(this.selectors.infoForm)
        const userForm = fieldElement.closest(this.selectors.form)
        const firstError = error[1] ? error[0] : error

        if (userForm && isRequiredElement) {
            const errorField = fieldElement.parentElement.querySelector(this.selectors.errorForm)
            
            errorField.innerHTML = firstError
        } else if (infoForm && isRequiredElement){
            const infoErrorField = fieldElement.parentElement.querySelector(this.selectors.infoFormError)

            infoErrorField.innerHTML = firstError
        }

    }

    validate(fieldElement) {
        const errorElement = fieldElement.validity;
        const errorMassege = [];

        Object.entries(this.errorMessages).forEach(([errorName, geterrorMassege]) => {
            if(errorElement[errorName]) {
                errorMassege.push(geterrorMassege(fieldElement))
            }});
        
        const isValid = errorMassege.length === 0;
        fieldElement.ariaInvalid = !isValid

        this.manageErrors(fieldElement, errorMassege)

        return isValid
    }

    onValid(event) {
        const { target } = event
        const isRequired = target.required;
        if (target.closest(this.selectors.form) || target.closest(this.selectors.infoForm) && isRequired) {
            this.validate(target)
        }
    }

    onChecked(event) {
        const { target } = event
        const isRequired = target.required;
        const isToggleType = ['radio', 'checkbox'].includes(target.type);

        if (isToggleType && isRequired) {
            this.validate(target)
        }
    }

    onSubmit(event) { 
        const thisFormElement = event.target.matches(this.selectors.form)
        const thisInfoFormElement = event.target.matches(this.selectors.infoForm)

        if (thisFormElement) {
            this.sendRegisterUserForm(event)   
        } else if (thisInfoFormElement) {
            this.sendInfoUserForm(event)
        }  else {
            return;
        }
        
    }

    sendRegisterUserForm(event) {
        const formElements = [...event.target.elements].filter(({ required })=> required);
            let validForm = true;
            let firstInvalidFieldControl = null;
            
            formElements.forEach((element) => {
                const isElementValid = this.validate(element)
                if(!isElementValid) {
                    validForm = false;
    
                    if (!firstInvalidFieldControl) {
                        firstInvalidFieldControl = element
                    }
                } 
            })
            if (!validForm) {
                event.preventDefault();
                firstInvalidFieldControl.focus();
                return;
            } else {
                this.fetchServer(event)
            }
    }

    sendInfoUserForm(event) {
        const infoFormElements = [...event.target.elements]
            let validInfoForm = true;
            let firstInvalidInfoFieldControl = null;

            infoFormElements.forEach((element) => {
                const isElementValid = this.validate(element)

                if(!isElementValid) {
                    validInfoForm = false;
    
                    if (!firstInvalidInfoFieldControl) {
                        firstInvalidInfoFieldControl = element
                    }
                } 
            })
            if (!validInfoForm) {
                event.preventDefault();
                firstInvalidInfoFieldControl.focus();
                return;
            } else {
                this.getFetchUserInfo(event)
            }
    }

    bindEvent() {
        document.addEventListener('blur', (event) => this.onValid(event), { capture: true })
        document.addEventListener('change', (event) => this.onChecked(event), { capture: true })
        document.addEventListener('input', (event) => this.onValid(event))
        document.addEventListener('submit', (event) => this.onSubmit(event))
    }

    getFetchUserInfo(event) {
        event.preventDefault()
        
        const userInfoData = document.querySelector(this.selectors.infoForm);
        const infoFormData = new FormData(userInfoData);
        const infoFormDataObject = Object.fromEntries(infoFormData);
        const infoFieldInner = document.querySelector('.form__get-info')

        const userPasswordError = event.target.querySelector(`.info__user-password>${this.selectors.infoFormError}`)

        const { getusername, getuserpassword } = infoFormDataObject

        if(!sessionStorage.getItem(getusername)) {
            infoFieldInner.textContent = 'Oops, this user not found. :('
            return;
        } else {
            const userInfoObject = JSON.parse(sessionStorage.getItem(getusername));
    
            const { username, userabout, 'user-gender': usergender, userpassword } = userInfoObject

            if (getuserpassword !== userpassword) {
                userPasswordError.textContent = 'Please enter the correct password'
                infoFieldInner.innerHTML = '';
            } else {
                infoFieldInner.innerHTML = `
                <p>
                Name: ${username} <br>
                ${userabout === '' ? '' : `About user: <br> ${userabout} <br>`}
                Gender: ${usergender}
                </p>
                `
            }
    
        }
    }

    fetchServer(event) {
        event.preventDefault()

        const userRegisterForm = document.querySelector(this.selectors.form)

        const formData = new FormData(userRegisterForm)
        const formDataObject = Object.fromEntries(formData)

        const errorMasegge = userRegisterForm.querySelector(this.selectors.errorForm)

        
        const userCount = sessionStorage.length

            if (sessionStorage.getItem(formDataObject.username.trim())) {
                errorMasegge.textContent = 'This username is already taken'
                return;
            } else {
                sessionStorage.setItem(formDataObject.username.trim(),
                    JSON.stringify({id: userCount, ...formDataObject}))
                    userRegisterForm.reset();
                }
        }
    }
new UserForm()
