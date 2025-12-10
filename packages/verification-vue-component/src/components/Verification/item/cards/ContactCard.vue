<template>
    <BaseCard class="help-card">
        <template #header>
            <div class="title">
                <span class="help-card-title">{{ _$t('verification.card.contact.title') }}</span>
            </div>
        </template>
        <template #body>
            <form id="contact-form" method="POST" @submit="checkForm">
                <div class="email-field" :class="{ error: errors.email }">
                    <label for="email">{{ _$t('verification.card.contact.form.email') }}</label>
                    <input id="email" v-model="email" type="email" name="email" />
                </div>
                <div class="question-field" :class="{ error: errors.question }">
                    <label for="question">{{ _$t('verification.card.contact.form.question') }}</label>
                    <textarea id="question" v-model="question" name="question"></textarea>
                </div>
                <div class="consent-field" :class="{ error: errors.consent }">
                    <label class="switch">
                        <input id="consent" v-model="consentAccepted" type="checkbox" />
                        <span class="slider round"></span>
                    </label>
                    <label for="consent" class="consent" v-html="_$t('verification.card.contact.form.consent')" />
                </div>
                <span v-if="contactFormSuccessful" class="message-sent success">
                    {{ _$t('verification.card.contact.form.submitted') }}
                </span>
                <span v-if="contactFormFailed" class="message-sent failed">
                    {{ _$t('verification.card.contact.form.failed') }}
                </span>
            </form>
        </template>
        <template #footer>
            <div class="left">
                <button class="btn btn-secondary" @click="toggleHelp('contact')">
                    <span>{{ _$t('verification.card.btn.back') }}</span>
                </button>
            </div>
            <div class="right">
                <button type="submit" form="contact-form" class="btn btn-primary" :disabled="contactFormSubmitting">
                    <img
                        v-if="contactFormSubmitting"
                        class="loading-spinner"
                        src="../../../../assets/img/loading_spinner.svg"
                        alt="Spinner" />
                    <span v-else>{{ _$t('verification.card.contact.form.submit') }}</span>
                </button>
            </div>
        </template>
    </BaseCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper.ts'
import BaseCard from './BaseCard.vue'

export default defineComponent({
    name: 'ContactCard',
    components: {
        BaseCard,
    },
    mixins: [i18nWrapperMixin],
    props: {
        certifactionApiUrl: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            contactFormSubmitting: false,
            contactFormSuccessful: false,
            contactFormFailed: false,
            reactiveValidation: false,
            email: null,
            question: null,
            consentAccepted: false,
            errors: {
                email: false,
                question: false,
                consent: false,
            },
        }
    },
    watch: {
        email: function () {
            if (this.reactiveValidation) {
                this.validate()
            }
        },
        question: function () {
            if (this.reactiveValidation) {
                this.validate()
            }
        },
        consentAccepted: function () {
            if (this.reactiveValidation) {
                this.validate()
            }
        },
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        },
        checkForm: function (e) {
            e.preventDefault()
            this.reactiveValidation = true
            this.contactFormSuccessful = this.contactFormFailed = false

            if (this.validate()) {
                this.postForm()
            }
        },
        validate() {
            const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

            this.errors.email = this.errors.question = this.errors.consent = false

            if (!this.email || (!!this.email && !emailRegex.test(this.email))) {
                this.errors.email = true
            }
            if (!this.question) {
                this.errors.question = true
            }
            if (!this.consentAccepted) {
                this.errors.consent = true
            }

            return !(this.errors.email || this.errors.question || this.errors.consent)
        },
        async postForm() {
            this.contactFormSubmitting = true

            try {
                await axios.post(`${this.certifactionApiUrl}/support/request`, {
                    origin: 'Verification Tool',
                    contact_email: this.email,
                    subject: 'Support request',
                    body: this.question,
                })

                this.contactFormSuccessful = true
                this.email = this.question = null
                this.consentAccepted = false
            } catch (error) {
                console.log('postForm() catch()', error, error.response.data)
                this.contactFormFailed = true
            }

            this.contactFormSubmitting = this.reactiveValidation = false
        },
    },
})
</script>
