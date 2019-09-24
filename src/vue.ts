import { calculer_points, get_score_joueur, Joueur, Partie, Points } from './tarot';

declare const Vue: any;
declare const $: any;

const joueurValidation = {
  rules: [
    {
      type   : 'empty',
      prompt : 'Veuillez entrer un nom de joueur'
    }
  ]
};

Vue.directive('form-joueurs', {
  bind: function () {
    $(this.el).form({
      fields: {
        'joueur-1': joueurValidation,
        'joueur-2': joueurValidation,
        'joueur-3': joueurValidation,
        'joueur-4': joueurValidation,
        'joueur-5': joueurValidation,
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
  },
  template: `<div class="field">
      <label>{{label}}</label>
      <select v-model="parentModel" v-dropdown>
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

const parse_page = (page: string) => {
  const tuple = page.split('-');
  if (tuple.length === 1) return [tuple[0], null] as [string, null];
  return [tuple[0], parseInt(tuple[1], 10)] as [string, number];
};

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
  start: function start(this: VueSelf) {
    this.change_page('partie-1');
  },
  change_page: function change_page(this: VueSelf, nextpage: string) {
    this.page = nextpage;
  },
  trigger_update_scores: function(this: VueSelf, partien: number) {
    const partie = this.parties[partien-1];
    try {
      this.update_scores(partien-1, partie.quiapris!, partie.avecquelappele!, calculer_points(this.joueurs.length, partie));
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
  { update_scores: (indice: number, quiapris: Joueur, avecquelappele: Joueur, points: Points) => void } &
  { update_score_total: () => void };

export default new Vue({
  el: '#app',
  data: data,
  methods: methods,
  watch: {
    page: function (this:VueSelf, val: string) {
      const [, nextI] = parse_page(val);
      if (nextI !== null && !this.parties[nextI]) {
        this.parties.push({});
      }
      Vue.nextTick(() => {
        $.tab('change tab', val);
      });
    }
  },
});