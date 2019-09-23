var JoueursComponent = Vue.extend({
    props: {
        id: String,
        parentModel: {
            twoWay: true
        },
        joueurs: Array,
        n: Number
    },
    template: '<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">' +
        '<template v-for="joueur in joueurs" track-by="$index">' +
        '<input type="radio" v-model="parentModel" name="{{ id }}_{{n}}" id="{{ id }}_P{{$index + 1}}_{{n}}" value="P{{$index + 1}}" v-jqm-radio>' +
        '<label for="{{ id }}_P{{$index + 1}}_{{n}}">{{joueur}}</label>' +
        '</template>' +
        '</fieldset>'
});
Vue.component('joueurs', JoueursComponent);
export default new Vue({
    el: '#app',
    data: {
        page: 0,
        parties: [
            { n: 1, quiapris: 'P1' }
        ],
        scores: [],
        scoretotal: [0, 0, 0],
        joueurs: ['', '', '']
    },
});
