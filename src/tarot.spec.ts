import tarot, { Contrat, get_chelem, get_chelem_calc, get_fait_de, get_petit, get_poignee, get_points_appel, Joueur, Poignee } from './tarot';

test('get_fait_de', () => {
  expect(get_fait_de(56, 0)).toBe(0);
  expect(get_fait_de(51, 1)).toBe(0);
  expect(get_fait_de(41, 2)).toBe(0);
  expect(get_fait_de(36, 3)).toBe(0);
  expect(get_fait_de(0, 3)).toBe(-36);
  expect(get_fait_de(91, 3)).toBe(55);
});

test('get_points_appel', () => {
  expect(get_points_appel(0, Contrat.Petite)).toBe(25);
  expect(get_points_appel(10, Contrat.Petite)).toBe(35);
  expect(get_points_appel(-10, Contrat.Petite)).toBe(-35);
  expect(get_points_appel(0, Contrat.Garde)).toBe(50);
  expect(get_points_appel(10, Contrat.Garde)).toBe(70);
  expect(get_points_appel(-10, Contrat.Garde)).toBe(-70);
  expect(get_points_appel(0, Contrat.GardeSans)).toBe(100);
  expect(get_points_appel(10, Contrat.GardeSans)).toBe(140);
  expect(get_points_appel(-10, Contrat.GardeSans)).toBe(-140);
  expect(get_points_appel(0, Contrat.GardeContre)).toBe(150);
  expect(get_points_appel(10, Contrat.GardeContre)).toBe(210);
  expect(get_points_appel(-10, Contrat.GardeContre)).toBe(-210);
});

test('get_points_appel', () => {
  const J1: Joueur = 'J1';
  const J2: Joueur = 'J2';
  const J3: Joueur = 'J3';
  expect(get_petit(J1, J1, J2, Contrat.Petite)).toBe(10);
  expect(get_petit(J2, J1, J2, Contrat.Petite)).toBe(10);
  expect(get_petit(J3, J1, J2, Contrat.Petite)).toBe(-10);
  expect(get_petit(J1, J1, J2, Contrat.Garde)).toBe(20);
  expect(get_petit(J2, J1, J2, Contrat.Garde)).toBe(20);
  expect(get_petit(J3, J1, J2, Contrat.Garde)).toBe(-20);
  expect(get_petit(J1, J1, J2, Contrat.GardeSans)).toBe(40);
  expect(get_petit(J2, J1, J2, Contrat.GardeSans)).toBe(40);
  expect(get_petit(J3, J1, J2, Contrat.GardeSans)).toBe(-40);
  expect(get_petit(J1, J1, J2, Contrat.GardeContre)).toBe(60);
  expect(get_petit(J2, J1, J2, Contrat.GardeContre)).toBe(60);
  expect(get_petit(J3, J1, J2, Contrat.GardeContre)).toBe(-60);
});

test('get_poignee', () => {
  const J1: Joueur = 'J1';
  expect(get_poignee(J1, Poignee.Simple, 10)).toBe(20);
  expect(get_poignee(J1, Poignee.Double, 10)).toBe(30);
  expect(get_poignee(J1, Poignee.Triple, 10)).toBe(40);
  expect(get_poignee(J1, Poignee.Simple, 0)).toBe(20);
  expect(get_poignee(J1, Poignee.Double, 0)).toBe(30);
  expect(get_poignee(J1, Poignee.Triple, 0)).toBe(40);
  expect(get_poignee(J1, Poignee.Simple, -10)).toBe(-20);
  expect(get_poignee(J1, Poignee.Double, -10)).toBe(-30);
  expect(get_poignee(J1, Poignee.Triple, -10)).toBe(-40);
});

test('get_chelem_calc', () => {
  expect(get_chelem_calc(true, false, true, false)).toBe(400);
  expect(get_chelem_calc(true, false, false, false)).toBe(-200);
  expect(get_chelem_calc(true, false, false, true)).toBe(-200);
  expect(get_chelem_calc(false, true, true, false)).toBe(200);
  expect(get_chelem_calc(false, true, false, false)).toBe(200);
  expect(get_chelem_calc(false, true, false, true)).toBe(-400);
});

test('get_chelem', () => {
  const spy = jest.spyOn(tarot, 'get_chelem_calc');
  const J1: Joueur = 'J1';
  const J2: Joueur = 'J2';
  const J3: Joueur = 'J3';
  expect(get_chelem(J1, J1, J1, J2)).not.toBe(0);
  expect(spy).toHaveBeenLastCalledWith(true, false, true, false);
  expect(get_chelem(undefined, J1, J1, J2)).not.toBe(0);
  expect(spy).toHaveBeenLastCalledWith(false, false, true, false);
  expect(get_chelem(J3, J1, J1, J2)).not.toBe(0);
  expect(spy).toHaveBeenLastCalledWith(false, true, true, false);

  expect(get_chelem(J1, J3, J1, J2)).not.toBe(0);
  expect(spy).toHaveBeenLastCalledWith(true, false, false, true);
  expect(get_chelem(undefined, J3, J1, J2)).not.toBe(0);
  expect(spy).toHaveBeenLastCalledWith(false, false, false, true);
  expect(get_chelem(J3, J3, J1, J2)).not.toBe(0);
  expect(spy).toHaveBeenLastCalledWith(false, true, false, true);

  expect(get_chelem(J1, undefined, J1, J2)).not.toBe(0);
  expect(spy).toHaveBeenLastCalledWith(true, false, false, false);
  expect(get_chelem(undefined, undefined, J1, J2)).toBe(0);
  expect(get_chelem(J3, undefined, J1, J2)).not.toBe(0);
  expect(spy).toHaveBeenLastCalledWith(false, true, false, false);

  spy.mockRestore();
});
