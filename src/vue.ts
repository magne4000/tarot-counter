import { calculer_points, get_score_joueur, Joueur, Partie, Points } from './tarot';

declare const Vue: any;
declare const $: any;

Vue.directive('form-joueurs', {
  bind: function () {
    $(this.el).form({
      fields: {
        'joueur-1': 'empty',
        'joueur-2': 'empty',
        'joueur-3': 'empty',
        'joueur-4': 'empty',
        'joueur-5': 'empty',
      }
    });
  },
});

$.fn.form.settings.rules.bothEmptyOrNot = function(value: string, otherField: string) {
  let matchingValue: string | null = null;
  if( $('[data-validate="'+ otherField +'"]').length > 0 ) {
    matchingValue = $('[data-validate="'+ otherField +'"]').val();
  }
  else if($('#' + otherField).length > 0) {
    matchingValue = $('#' + otherField).val();
  }
  else if($('[name="' + otherField +'"]').length > 0) {
    matchingValue = $('[name="' + otherField + '"]').val();
  }
  else if( $('[name="' + otherField +'[]"]').length > 0 ) {
    matchingValue = $('[name="' + otherField +'[]"]');
  }
  return (matchingValue && value) || (!matchingValue && !value);
};

Vue.directive('form-partie', {
  bind: function () {
    $(this.el).form({
      fields: {
        quiapris: 'empty',
        avecquelappele: 'empty',
        quelcontrat: 'empty',
        pointscomptesattaque: 'integer[0..91]',
        nombredeboutsfaits: 'integer[1..3]',
        poignee1annonceepar: 'bothEmptyOrNot[typedepoignee1]',
        typedepoignee1: 'bothEmptyOrNot[poignee1annonceepar]',
        poignee2annonceepar: 'bothEmptyOrNot[typedepoignee2]',
        typedepoignee2: 'bothEmptyOrNot[poignee2annonceepar]',
      }
    });
  },
});

Vue.directive('tabular', {
  bind: function () {
    $(this.el).find('.item').tab();
  },
  update: function () {
    $(this.el).find('.item').tab('refresh');
  },
});

Vue.directive('dropdown', {
  bind: function () {
    $(this.el).dropdown();
  },
  update: function () {
    $(this.el).dropdown('refresh');
  },
});

const JoueursComponent = Vue.extend({
  props: {
    id: String,
    parentModel: {
      twoWay: true
    },
    label: String,
    joueurs: Array,
    name: String,
  },
  template: `<div class="field">
      <label>{{label}}</label>
      <select name="{{name}}" v-model="parentModel" v-dropdown>
        <option value="">Joueur</option>
        <option v-for="joueur in joueurs" :value="joueur" track-by="$index">
          {{joueur.nom}}
        </option>
      </select>
    </div>`
});

Vue.component('joueurs', JoueursComponent);

type Score = {
  score: number,
  apris: boolean,
  estappele: boolean,
}

const nouveau_joueur = (): Joueur => ({ nom: '' });

const data = {
  page: 'index' as string,
  parties: [] as Partial<Partie>[],
  scores: [] as Score[][],
  scoretotal: [] as number[],
  joueurs: [nouveau_joueur(), nouveau_joueur(), nouveau_joueur()] as Joueur[]
};

const methods = {
  ismax: function ismax(value: number, values: number[]) {
    return Math.max(...values) === value;
  },
  add_player: function add_player(this: VueSelf) {
    if (this.joueurs.length < 5) {
      this.joueurs.push(nouveau_joueur());
      this.scoretotal.push(0);
    }
  },
  start: function start(this: VueSelf, e: Event) {
    if (!$(e.target).form('is valid')) return;
    this.go_next_partie(0);
  },
  change_page: function change_page(this: VueSelf, nextpage: string) {
    this.page = nextpage;
  },
  go_next_partie: function(this: VueSelf, partien: number) {
    if (partien >= this.parties.length) {
      this.parties.push({});
    }
    this.change_page('partie-' + (partien+1));
  },
  trigger_update_scores: function(this: VueSelf, e: Event, partien: number) {
    if (!$(e.target).form('is valid')) return;
    const partie = this.parties[partien-1];
    try {
      this.update_scores(partien-1, partie.quiapris!, partie.avecquelappele!, calculer_points(this.joueurs.length, partie));
      this.go_next_partie(partien);
    } catch (e) {
      console.error(e);
    }
  },
  update_scores: function update_scores(this: VueSelf, indice: number, quiapris: Joueur, avecquelappele: Joueur, points: Points) {
    const scoreLine: Score[] = [];
    for (const joueur of this.joueurs) {
      scoreLine.push({
        score: get_score_joueur(joueur, quiapris, avecquelappele, points),
        apris: quiapris === joueur,
        estappele: avecquelappele === joueur
      });
    }
    (this.scores as any).$set(indice, scoreLine);
    this.update_score_total();
  },
  update_score_total: function update_score_total(this: VueSelf) {
    let i=0, j, score_total=[];
    for (; i<this.scores.length; i++) {
      for (j=0; j<this.scores[i].length; j++) {
        if (!score_total[j]) score_total.push(this.scores[i][j].score);
        else {
          score_total[j] += this.scores[i][j].score;
        }
      }
    }
    this.scoretotal = score_total;
  },
};

type VueSelf = typeof data &
  { change_page: (nextpage: string) => void } &
  { go_next_partie: (partien: number) => void } &
  { update_scores: (indice: number, quiapris: Joueur, avecquelappele: Joueur, points: Points) => void } &
  { update_score_total: () => void };

export default new Vue({
  el: '#app',
  data: data,
  methods: methods,
  watch: {
    page: function (this:VueSelf, val: string) {
      Vue.nextTick(() => {
        $.tab('change tab', val);
      });
    }
  },
});