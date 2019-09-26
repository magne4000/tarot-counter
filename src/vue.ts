import { calculer_points, get_score_joueur, Joueur, Contrat, Partie, Points } from './tarot';

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
        nombredeboutsfaits: 'integer[0..3]',
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
  update: function (value: any) {
    if (value !== undefined) {
      $(this.el).dropdown('set selected', value);
    }
    $(this.el).dropdown('refresh');
  },
});

const JoueursComponent = Vue.extend({
  props: {
    id: String,
    parentModel: {
      twoWay: true,
    },
    label: String,
    joueurs: Array,
    name: String,
  },
  template: `<div class="field">
      <label>{{label}}</label>
      <select name="{{name}}" v-model="parentModel" v-dropdown="parentModel">
        <option value="">Joueur</option>
        <option v-for="joueur in joueurs" :value="joueur" track-by="$index">
          {{joueur}}
        </option>
      </select>
    </div>`
});

Vue.component('joueurs', JoueursComponent);

type ScoreCol = {
  score: number,
  apris: boolean,
  estappele: boolean,
}

type ScoreLine = {
  scores: ScoreCol[],
  contrat: {
    label: string,
    color: string,
  },
}

const nouveau_joueur = (): Joueur => '';
const contrat_str = (contrat: Contrat) => {
  switch (contrat) {
    case Contrat.Petite: return 'Petite';
    case Contrat.Garde: return 'Garde';
    case Contrat.GardeSans: return 'Garde Sans';
    case Contrat.GardeContre: return 'Garde Contre';
  }
}

const data = {
  last: {
    joueurs: localStorage.joueurs ? JSON.parse(localStorage.joueurs) : false
  },
  page: 'index' as string,
  parties: [] as Partial<Partie>[],
  scores: [] as ScoreLine[],
  scoretotal: [] as number[],
  joueurs: [nouveau_joueur(), nouveau_joueur(), nouveau_joueur()] as Joueur[]
};

const methods = {
  ismax: function ismax(value: number, values: number[]) {
    return Math.max(...values) === value;
  },
  clear_derniere_partie: function clear_derniere_partie(this: VueSelf) {
    localStorage.clear();
    this.last.joueurs = false;
  },
  reprendre_derniere_partie: function reprendre_derniere_partie(this: VueSelf) {
    const parties = localStorage.parties ? JSON.parse(localStorage.parties) : this.parties;
    const page = 'partie-' + parties.length;
    const joueurs = localStorage.joueurs ? JSON.parse(localStorage.joueurs) : this.joueurs;
    const scores = localStorage.scores ? JSON.parse(localStorage.scores) : this.scores;
    this.clear_derniere_partie();

    Vue.nextTick(() => {
      this.joueurs = joueurs;
      this.parties = parties;
      this.scores = scores;
      this.update_score_total();
      this.page = page;
    });
  },
  add_player: function add_player(this: VueSelf) {
    if (this.joueurs.length < 5) {
      this.joueurs.push(nouveau_joueur());
    }
  },
  del_player: function del_player(this: VueSelf) {
    if (this.joueurs.length > 3) {
      this.joueurs.pop();
    }
  },
  update: function update(this: any, path: string, value: any) {
    this.$set(path, value)
  },
  start: function start(this: VueSelf, e: Event) {
    if (!$(e.target).form('is valid')) return;
    this.last.joueurs = false;
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
  trigger_update_scores: function(this: VueSelf, e: Event, indice: number) {
    if (!$(e.target).form('is valid')) return;
    const partie = this.parties[indice] as Partie;
    this.update_scores(indice, partie.quiapris!, partie.avecquelappele!, calculer_points(this.joueurs.length, partie), partie.quelcontrat!);
    this.go_next_partie(indice + 1);
  },
  update_scores: function update_scores(this: VueSelf, indice: number, quiapris: Joueur, avecquelappele: Joueur, points: Points, contrat: Contrat) {
    const scores: ScoreCol[] = [];
    for (const joueur of this.joueurs) {
      scores.push({
        score: get_score_joueur(joueur, quiapris, avecquelappele, points),
        apris: quiapris === joueur,
        estappele: avecquelappele === joueur,
      });
    }
    (this.scores as any).$set(indice, {
      scores: scores,
      contrat: {
        label: contrat_str(contrat),
        color: points.preneur >= 0 ? 'green' : 'red',
      },
    } as ScoreLine);
    this.update_score_total();
  },
  update_score_total: function update_score_total(this: VueSelf) {
    let i=0, j, score_total=[];
    for (; i<this.scores.length; i++) {
      for (j=0; j<this.scores[i].scores.length; j++) {
        if (!score_total[j]) score_total.push(this.scores[i].scores[j].score);
        else {
          score_total[j] += this.scores[i].scores[j].score;
        }
      }
    }
    this.scoretotal = score_total;
  },
};

type VueSelf = typeof data &
  { change_page: (nextpage: string) => void } &
  { go_next_partie: (partien: number) => void } &
  { update_scores: (indice: number, quiapris: Joueur, avecquelappele: Joueur, points: Points, contrat: Contrat) => void } &
  { update_score_total: () => void } &
  { clear_derniere_partie: () => void };

export default new Vue({
  el: '#app',
  data: data,
  methods: methods,
  watch: {
    page: function (this:VueSelf, val: string) {
      Vue.nextTick(() => {
        $.tab('change tab', val);
      });
      localStorage.page = val;
    },
    parties: {
      handler: function (this:VueSelf, val: Partie[]) {
        localStorage.parties = JSON.stringify(val);
      },
      deep: true,
    },
    joueurs: {
      handler: function (this:VueSelf, val: Joueur[]) {
        localStorage.joueurs = JSON.stringify(val);
      },
      deep: true,
    },
    scores: {
      handler: function (this:VueSelf, val: ScoreLine[]) {
        localStorage.scores = JSON.stringify(val);
      },
      deep: true,
    },
  },
});
